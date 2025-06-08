
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'pending';
  progress?: number;
}

interface ProgressTrackerProps {
  title: string;
  steps: ProgressStep[];
  showProgress?: boolean;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  title, 
  steps, 
  showProgress = false 
}) => {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const overallProgress = (completedSteps / totalSteps) * 100;

  const getStepIcon = (status: string, progress?: number) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'current':
        return progress !== undefined ? (
          <div className="relative">
            <Circle className="h-5 w-5 text-autheo-primary" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 bg-autheo-primary rounded-full animate-pulse" />
            </div>
          </div>
        ) : <Clock className="h-5 w-5 text-autheo-primary" />;
      default:
        return <Circle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-900/20 text-green-400 border-green-400">Completed</Badge>;
      case 'current':
        return <Badge className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="text-slate-400 border-slate-400">Pending</Badge>;
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <div className="flex justify-between items-start">
          <CardTitle className="text-autheo-primary">{title}</CardTitle>
          <div className="text-right">
            <div className="text-sm text-slate-300">
              {completedSteps} of {totalSteps} completed
            </div>
            {showProgress && (
              <div className="w-32 mt-2">
                <Progress value={overallProgress} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="p-4 border-b border-slate-700 last:border-b-0">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {getStepIcon(step.status, step.progress)}
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-8 mt-2 ${
                        step.status === 'completed' ? 'bg-green-500' : 'bg-slate-600'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-slate-200">{step.title}</h4>
                      {getStepBadge(step.status)}
                    </div>
                    {step.description && (
                      <p className="text-sm text-slate-400 mb-2">{step.description}</p>
                    )}
                    {step.status === 'current' && step.progress !== undefined && (
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{step.progress}%</span>
                        </div>
                        <Progress value={step.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
