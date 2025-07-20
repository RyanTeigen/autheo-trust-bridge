import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Target, Plus, Edit2, Check, X } from 'lucide-react';

interface HealthGoal {
  id?: string;
  type: string;
  target_value: number;
  current_value: number;
  unit: string;
  description: string;
  deadline: string;
  created_at?: string;
}

const HealthGoals: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [newGoal, setNewGoal] = useState<Omit<HealthGoal, 'id' | 'created_at'>>({
    type: '',
    target_value: 0,
    current_value: 0,
    unit: '',
    description: '',
    deadline: ''
  });

  useEffect(() => {
    loadGoals();
  }, [user]);

  const loadGoals = async () => {
    if (!user?.id) return;
    
    try {
      // For now, we'll store goals in localStorage since we don't have a goals table
      const savedGoals = localStorage.getItem(`health_goals_${user.id}`);
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals));
      } else {
        // Default goals
        const defaultGoals: HealthGoal[] = [
          {
            id: '1',
            type: 'weight',
            target_value: 150,
            current_value: 160,
            unit: 'lbs',
            description: 'Reach target weight',
            deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          },
          {
            id: '2',
            type: 'blood_pressure',
            target_value: 120,
            current_value: 130,
            unit: 'mmHg',
            description: 'Lower systolic blood pressure',
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        ];
        setGoals(defaultGoals);
        localStorage.setItem(`health_goals_${user.id}`, JSON.stringify(defaultGoals));
      }
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = (updatedGoals: HealthGoal[]) => {
    if (!user?.id) return;
    localStorage.setItem(`health_goals_${user.id}`, JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };

  const addGoal = () => {
    if (!newGoal.type || !newGoal.description) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const goal: HealthGoal = {
      ...newGoal,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };

    const updatedGoals = [...goals, goal];
    saveGoals(updatedGoals);
    
    setNewGoal({
      type: '',
      target_value: 0,
      current_value: 0,
      unit: '',
      description: '',
      deadline: ''
    });
    setShowAddForm(false);

    toast({
      title: "Goal Added",
      description: "Your health goal has been successfully added.",
    });
  };

  const updateGoalProgress = (goalId: string, newCurrentValue: number) => {
    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, current_value: newCurrentValue }
        : goal
    );
    saveGoals(updatedGoals);
    setEditingGoal(null);
  };

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    saveGoals(updatedGoals);
    
    toast({
      title: "Goal Deleted",
      description: "Your health goal has been removed.",
    });
  };

  const getProgress = (goal: HealthGoal): number => {
    if (goal.target_value === 0) return 0;
    
    // For goals where lower is better (like weight loss or blood pressure)
    if (goal.type === 'weight' || goal.type === 'blood_pressure') {
      const progress = Math.max(0, 100 - ((goal.current_value - goal.target_value) / goal.target_value) * 100);
      return Math.min(100, progress);
    }
    
    // For goals where higher is better
    return Math.min(100, (goal.current_value / goal.target_value) * 100);
  };

  const isGoalAchieved = (goal: HealthGoal): boolean => {
    if (goal.type === 'weight' || goal.type === 'blood_pressure') {
      return goal.current_value <= goal.target_value;
    }
    return goal.current_value >= goal.target_value;
  };

  const getDaysUntilDeadline = (deadline: string): number => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading goals...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Health Goals
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Goal Form */}
        {showAddForm && (
          <div className="p-4 border border-border rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="goalType">Goal Type</Label>
                <Input
                  id="goalType"
                  placeholder="e.g., weight, blood_pressure"
                  value={newGoal.type}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="goalUnit">Unit</Label>
                <Input
                  id="goalUnit"
                  placeholder="e.g., lbs, mmHg"
                  value={newGoal.unit}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="goalDescription">Description</Label>
              <Input
                id="goalDescription"
                placeholder="Describe your goal..."
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="targetValue">Target</Label>
                <Input
                  id="targetValue"
                  type="number"
                  value={newGoal.target_value}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target_value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="currentValue">Current</Label>
                <Input
                  id="currentValue"
                  type="number"
                  value={newGoal.current_value}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, current_value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={addGoal} size="sm">
                <Check className="h-4 w-4 mr-1" />
                Add Goal
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No health goals set. Add your first goal to start tracking progress!
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{goal.description}</h4>
                  <div className="flex items-center gap-2">
                    {isGoalAchieved(goal) && (
                      <Badge variant="default" className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        Achieved
                      </Badge>
                    )}
                    <Button
                      onClick={() => setEditingGoal(goal.id || null)}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteGoal(goal.id || '')}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress: {getProgress(goal).toFixed(1)}%</span>
                    <span>
                      {editingGoal === goal.id ? (
                        <Input
                          type="number"
                          className="w-20 h-6 text-xs"
                          defaultValue={goal.current_value}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateGoalProgress(goal.id!, parseFloat((e.target as HTMLInputElement).value));
                            }
                          }}
                          onBlur={(e) => updateGoalProgress(goal.id!, parseFloat(e.target.value))}
                        />
                      ) : (
                        `${goal.current_value} / ${goal.target_value} ${goal.unit}`
                      )}
                    </span>
                  </div>
                  
                  <Progress value={getProgress(goal)} className="h-2" />
                  
                  <div className="text-xs text-muted-foreground">
                    {getDaysUntilDeadline(goal.deadline) > 0 
                      ? `${getDaysUntilDeadline(goal.deadline)} days remaining`
                      : 'Deadline passed'
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthGoals;