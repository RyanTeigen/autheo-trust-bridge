
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, CheckSquare, Clipboard, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: 'privacy' | 'security' | 'administrative' | 'physical' | 'breach';
  completed: boolean;
}

const ComplianceRecommendations: React.FC = () => {
  const { toast } = useToast();
  const [aiAssistMode, setAiAssistMode] = useState(false);
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([
    {
      id: 'rec1',
      title: 'Update Risk Assessment Documentation',
      description: 'The annual security risk assessment needs to be updated to reflect new cloud services and remote work policies.',
      impact: 'high',
      effort: 'medium',
      category: 'security',
      completed: false
    },
    {
      id: 'rec2',
      title: 'Complete Staff Security Training',
      description: 'Ensure all staff members complete required security awareness training by the end of the month.',
      impact: 'high',
      effort: 'low',
      category: 'administrative',
      completed: false
    },
    {
      id: 'rec3',
      title: 'Implement Multi-Factor Authentication',
      description: 'Deploy MFA across all systems that contain protected health information to strengthen access controls.',
      impact: 'high',
      effort: 'medium',
      category: 'security',
      completed: false
    },
    {
      id: 'rec4',
      title: 'Review Physical Safeguards',
      description: 'Conduct a comprehensive review of physical access controls at all locations storing PHI.',
      impact: 'medium',
      effort: 'medium',
      category: 'physical',
      completed: false
    },
    {
      id: 'rec5',
      title: 'Update Business Associate Agreements',
      description: 'Review and update BAAs with all vendors who have access to PHI to ensure they reflect current regulations.',
      impact: 'medium',
      effort: 'high',
      category: 'privacy',
      completed: true
    }
  ]);
  
  const toggleCompletion = (id: string) => {
    setRecommendations(recommendations.map(rec => 
      rec.id === id ? { ...rec, completed: !rec.completed } : rec
    ));
    
    const recommendation = recommendations.find(rec => rec.id === id);
    if (recommendation) {
      toast({
        title: recommendation.completed ? "Task Reopened" : "Task Completed",
        description: recommendation.title,
      });
    }
  };

  const getImpactBadge = (impact: string) => {
    switch(impact) {
      case 'high': 
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Impact</Badge>;
      case 'medium': 
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Medium Impact</Badge>;
      case 'low': 
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Impact</Badge>;
      default: 
        return null;
    }
  };
  
  const getEffortBadge = (effort: string) => {
    switch(effort) {
      case 'high': 
        return <Badge variant="outline" className="border-red-800 text-red-800">High Effort</Badge>;
      case 'medium': 
        return <Badge variant="outline" className="border-amber-800 text-amber-800">Medium Effort</Badge>;
      case 'low': 
        return <Badge variant="outline" className="border-green-800 text-green-800">Low Effort</Badge>;
      default: 
        return null;
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'privacy': return "🔒";
      case 'security': return "🛡️";
      case 'administrative': return "📝";
      case 'physical': return "🚪";
      case 'breach': return "⚠️";
      default: return "📋";
    }
  };
  
  // Filter recommendations based on AI assist mode
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    if (aiAssistMode) {
      // In AI assist mode, prioritize high impact + low effort first
      const aScore = (a.impact === 'high' ? 3 : a.impact === 'medium' ? 2 : 1) * 
                    (a.effort === 'low' ? 3 : a.effort === 'medium' ? 2 : 1);
      const bScore = (b.impact === 'high' ? 3 : b.impact === 'medium' ? 2 : 1) * 
                    (b.effort === 'low' ? 3 : b.effort === 'medium' ? 2 : 1);
      return bScore - aScore;
    }
    
    // Default: completed items at the bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return 0;
  });
  
  const percentComplete = Math.round(
    (recommendations.filter(rec => rec.completed).length / recommendations.length) * 100
  );
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
              Compliance Recommendations
            </CardTitle>
            <CardDescription>
              Prioritized actions to improve compliance
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={aiAssistMode ? "default" : "outline"} 
              size="sm"
              className={aiAssistMode ? "bg-purple-600 hover:bg-purple-700" : ""}
              onClick={() => {
                setAiAssistMode(!aiAssistMode);
                if (!aiAssistMode) {
                  toast({
                    title: "AI Prioritization Enabled",
                    description: "Tasks are now sorted by impact-effort ratio",
                  });
                }
              }}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI Prioritize
            </Button>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5">
          <div 
            className="bg-green-500 h-2.5 rounded-full" 
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>
        <div className="text-xs text-right text-muted-foreground">
          {recommendations.filter(r => r.completed).length} of {recommendations.length} completed ({percentComplete}%)
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        {sortedRecommendations.map((rec) => (
          <div 
            key={rec.id} 
            className={`border rounded-lg p-4 transition-all ${
              rec.completed ? "bg-muted" : ""
            } ${
              aiAssistMode && !rec.completed && rec.impact === 'high' && rec.effort === 'low' 
                ? "border-purple-300 bg-purple-50 dark:bg-purple-900/10" 
                : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <button 
                onClick={() => toggleCompletion(rec.id)}
                className={`mt-1 rounded-md border ${
                  rec.completed 
                    ? "bg-green-100 border-green-500 text-green-800" 
                    : "border-muted-foreground"
                } p-1 h-5 w-5 flex items-center justify-center`}
              >
                {rec.completed && <CheckSquare className="h-3 w-3" />}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span>{getCategoryIcon(rec.category)}</span>
                  <h3 className={`font-medium ${rec.completed ? "line-through text-muted-foreground" : ""}`}>
                    {rec.title}
                  </h3>
                </div>
                
                <p className={`text-sm mt-1 ${rec.completed ? "text-muted-foreground" : ""}`}>
                  {rec.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {getImpactBadge(rec.impact)}
                  {getEffortBadge(rec.effort)}
                  <Badge variant="outline" className="capitalize">
                    {rec.category}
                  </Badge>
                </div>
                
                {aiAssistMode && !rec.completed && rec.impact === 'high' && rec.effort === 'low' && (
                  <div className="mt-2 text-xs flex items-center text-purple-700 dark:text-purple-400">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI recommends completing this task first for maximum compliance impact
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <Clipboard className="h-4 w-4 mr-2" />
          Generate Compliance Task Report
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ComplianceRecommendations;
