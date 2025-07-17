import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Settings, 
  Trash2, 
  Clock, 
  Shield,
  Building,
  User
} from 'lucide-react';

interface AutoApprovalRule {
  id: string;
  rule_name: string;
  conditions: {
    permission_type?: string[];
    department?: string[];
    urgency_level?: string[];
    max_duration_hours?: number;
  };
  actions: {
    auto_approve: boolean;
    notification_delay_hours?: number;
    require_justification?: boolean;
  };
  is_active: boolean;
  created_at: string;
}

const AutoApprovalRulesConfig: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<AutoApprovalRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_name: '',
    permission_types: [] as string[],
    departments: [] as string[],
    urgency_levels: [] as string[],
    max_duration_hours: 24,
    auto_approve: true,
    notification_delay_hours: 0,
    require_justification: false
  });

  useEffect(() => {
    if (user) {
      fetchRules();
    }
  }, [user]);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_automation_rules')
        .select('*')
        .eq('created_by', user?.id)
        .eq('rule_type', 'auto_approval')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules((data || []) as unknown as AutoApprovalRule[]);
    } catch (error) {
      console.error('Error fetching rules:', error);
      toast({
        title: "Error",
        description: "Failed to load auto-approval rules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveRule = async () => {
    try {
      const ruleData = {
        rule_name: newRule.rule_name,
        rule_type: 'auto_approval',
        conditions: {
          permission_type: newRule.permission_types.length > 0 ? newRule.permission_types : undefined,
          department: newRule.departments.length > 0 ? newRule.departments : undefined,
          urgency_level: newRule.urgency_levels.length > 0 ? newRule.urgency_levels : undefined,
          max_duration_hours: newRule.max_duration_hours
        },
        actions: {
          auto_approve: newRule.auto_approve,
          notification_delay_hours: newRule.notification_delay_hours,
          require_justification: newRule.require_justification
        },
        is_active: true,
        created_by: user?.id
      };

      const { error } = await supabase
        .from('workflow_automation_rules')
        .insert([ruleData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Auto-approval rule created successfully",
      });

      setShowNewRuleForm(false);
      setNewRule({
        rule_name: '',
        permission_types: [],
        departments: [],
        urgency_levels: [],
        max_duration_hours: 24,
        auto_approve: true,
        notification_delay_hours: 0,
        require_justification: false
      });
      fetchRules();
    } catch (error) {
      console.error('Error saving rule:', error);
      toast({
        title: "Error",
        description: "Failed to save auto-approval rule",
        variant: "destructive"
      });
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('workflow_automation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Rule ${isActive ? 'enabled' : 'disabled'} successfully`,
      });

      fetchRules();
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast({
        title: "Error",
        description: "Failed to update rule",
        variant: "destructive"
      });
    }
  };

  const deleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('workflow_automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Rule deleted successfully",
      });

      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: "Error",
        description: "Failed to delete rule",
        variant: "destructive"
      });
    }
  };

  const addToArray = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (value && !array.includes(value)) {
      setter([...array, value]);
    }
  };

  const removeFromArray = (array: string[], value: string, setter: (arr: string[]) => void) => {
    setter(array.filter(item => item !== value));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Auto-Approval Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure automatic approval for specific types of access requests
          </p>
        </div>
        <Button onClick={() => setShowNewRuleForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {showNewRuleForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Auto-Approval Rule</CardTitle>
            <CardDescription>
              Define conditions for automatically approving access requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input
                id="rule-name"
                value={newRule.rule_name}
                onChange={(e) => setNewRule({...newRule, rule_name: e.target.value})}
                placeholder="e.g., Emergency Department Auto-Approval"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Permission Types</Label>
                <div className="space-y-2">
                  <Select
                    onValueChange={(value) => addToArray(newRule.permission_types, value, (arr) => setNewRule({...newRule, permission_types: arr}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add permission type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="write">Write</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1">
                    {newRule.permission_types.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                        <button
                          onClick={() => removeFromArray(newRule.permission_types, type, (arr) => setNewRule({...newRule, permission_types: arr}))}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label>Departments</Label>
                <div className="space-y-2">
                  <Select
                    onValueChange={(value) => addToArray(newRule.departments, value, (arr) => setNewRule({...newRule, departments: arr}))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="oncology">Oncology</SelectItem>
                      <SelectItem value="primary_care">Primary Care</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-1">
                    {newRule.departments.map((dept) => (
                      <Badge key={dept} variant="secondary" className="text-xs">
                        {dept}
                        <button
                          onClick={() => removeFromArray(newRule.departments, dept, (arr) => setNewRule({...newRule, departments: arr}))}
                          className="ml-1 text-xs"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label>Urgency Levels</Label>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => addToArray(newRule.urgency_levels, value, (arr) => setNewRule({...newRule, urgency_levels: arr}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1">
                  {newRule.urgency_levels.map((level) => (
                    <Badge key={level} variant="secondary" className="text-xs">
                      {level}
                      <button
                        onClick={() => removeFromArray(newRule.urgency_levels, level, (arr) => setNewRule({...newRule, urgency_levels: arr}))}
                        className="ml-1 text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="max-duration">Maximum Duration (hours)</Label>
              <Input
                id="max-duration"
                type="number"
                value={newRule.max_duration_hours}
                onChange={(e) => setNewRule({...newRule, max_duration_hours: parseInt(e.target.value) || 24})}
                min="1"
                max="8760"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-approve">Auto-approve matching requests</Label>
                <Switch
                  id="auto-approve"
                  checked={newRule.auto_approve}
                  onCheckedChange={(checked) => setNewRule({...newRule, auto_approve: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="require-justification">Require clinical justification</Label>
                <Switch
                  id="require-justification"
                  checked={newRule.require_justification}
                  onCheckedChange={(checked) => setNewRule({...newRule, require_justification: checked})}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={saveRule} disabled={!newRule.rule_name}>
                Save Rule
              </Button>
              <Button variant="outline" onClick={() => setShowNewRuleForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {rules.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Auto-Approval Rules</h3>
                <p className="text-muted-foreground mb-4">
                  Create rules to automatically approve certain types of access requests
                </p>
                <Button onClick={() => setShowNewRuleForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{rule.rule_name}</CardTitle>
                    <CardDescription>
                      Created {new Date(rule.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Permission Types:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.conditions.permission_type?.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">{type}</Badge>
                      )) || <span className="text-muted-foreground">Any</span>}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      Departments:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rule.conditions.department?.map((dept) => (
                        <Badge key={dept} variant="outline" className="text-xs">{dept}</Badge>
                      )) || <span className="text-muted-foreground">Any</span>}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Max Duration:
                    </span>
                    <span className="text-muted-foreground">{rule.conditions.max_duration_hours || 24} hours</span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Actions:</span>
                    <div className="text-muted-foreground">
                      {rule.actions.auto_approve && <div>• Auto-approve</div>}
                      {rule.actions.require_justification && <div>• Require justification</div>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AutoApprovalRulesConfig;