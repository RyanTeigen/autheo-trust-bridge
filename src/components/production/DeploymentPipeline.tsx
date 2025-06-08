
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  GitBranch, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Play, 
  Pause,
  AlertTriangle,
  Rocket
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeploymentStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

const DeploymentPipeline: React.FC = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStages, setDeploymentStages] = useState<DeploymentStage[]>([
    {
      id: 'lint',
      name: 'Code Quality Check',
      description: 'Running ESLint and TypeScript checks',
      status: 'pending'
    },
    {
      id: 'test',
      name: 'Test Suite',
      description: 'Running unit and integration tests',
      status: 'pending'
    },
    {
      id: 'security',
      name: 'Security Scan',
      description: 'Scanning for security vulnerabilities',
      status: 'pending'
    },
    {
      id: 'build',
      name: 'Production Build',
      description: 'Creating optimized production bundle',
      status: 'pending'
    },
    {
      id: 'performance',
      name: 'Performance Test',
      description: 'Validating bundle size and load times',
      status: 'pending'
    },
    {
      id: 'deploy-staging',
      name: 'Deploy to Staging',
      description: 'Deploying to staging environment',
      status: 'pending'
    },
    {
      id: 'integration-test',
      name: 'Integration Tests',
      description: 'Running end-to-end tests on staging',
      status: 'pending'
    },
    {
      id: 'deploy-production',
      name: 'Deploy to Production',
      description: 'Deploying to production environment',
      status: 'pending'
    }
  ]);
  
  const { toast } = useToast();
  
  const startDeployment = async () => {
    setIsDeploying(true);
    
    // Reset all stages to pending
    setDeploymentStages(stages => 
      stages.map(stage => ({ ...stage, status: 'pending' as const, duration: undefined, error: undefined }))
    );
    
    // Simulate deployment pipeline
    for (let i = 0; i < deploymentStages.length; i++) {
      const stage = deploymentStages[i];
      
      // Mark stage as running
      setDeploymentStages(stages => 
        stages.map(s => s.id === stage.id ? { ...s, status: 'running' as const } : s)
      );
      
      // Simulate stage execution time
      const executionTime = Math.random() * 3000 + 1000; // 1-4 seconds
      await new Promise(resolve => setTimeout(resolve, executionTime));
      
      // Simulate occasional failures for demo (5% chance)
      const shouldFail = Math.random() < 0.05 && stage.id !== 'deploy-production';
      
      if (shouldFail) {
        setDeploymentStages(stages => 
          stages.map(s => s.id === stage.id ? { 
            ...s, 
            status: 'failed' as const,
            duration: Math.round(executionTime),
            error: `Stage failed: ${stage.name} encountered an error`
          } : s)
        );
        
        toast({
          title: "Deployment Failed",
          description: `${stage.name} failed. Please check the logs and retry.`,
          variant: "destructive"
        });
        
        setIsDeploying(false);
        return;
      }
      
      // Mark stage as successful
      setDeploymentStages(stages => 
        stages.map(s => s.id === stage.id ? { 
          ...s, 
          status: 'success' as const,
          duration: Math.round(executionTime)
        } : s)
      );
    }
    
    setIsDeploying(false);
    
    toast({
      title: "Deployment Successful",
      description: "Application has been successfully deployed to production!",
    });
  };
  
  const getStageIcon = (status: DeploymentStage['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-slate-400" />;
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getStageStatus = (status: DeploymentStage['status']) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'running':
        return 'default';
      case 'success':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'skipped':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  const completedStages = deploymentStages.filter(stage => stage.status === 'success').length;
  const totalStages = deploymentStages.length;
  const progress = (completedStages / totalStages) * 100;
  
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Deployment Pipeline
            </CardTitle>
            <CardDescription className="text-slate-400">
              Automated deployment process with quality gates
            </CardDescription>
          </div>
          <Button
            onClick={startDeployment}
            disabled={isDeploying}
            className="bg-green-600 hover:bg-green-700"
          >
            {isDeploying ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Deploy
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Overview */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Progress</span>
            <span>{completedStages}/{totalStages} stages completed</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Deployment Stages */}
        <div className="space-y-3">
          {deploymentStages.map((stage, index) => (
            <div
              key={stage.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50 border border-slate-600"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600">
                  <span className="text-xs font-medium text-slate-300">{index + 1}</span>
                </div>
                {getStageIcon(stage.status)}
                <div>
                  <div className="font-medium text-slate-100">{stage.name}</div>
                  <div className="text-sm text-slate-400">{stage.description}</div>
                  {stage.error && (
                    <div className="text-sm text-red-400 mt-1">{stage.error}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {stage.duration && (
                  <span className="text-xs text-slate-500">{stage.duration}ms</span>
                )}
                <Badge variant={getStageStatus(stage.status)} className="capitalize">
                  {stage.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        
        {/* Deployment Information */}
        <div className="mt-6 p-3 bg-slate-700/30 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Environment:</span>
              <span className="text-slate-100 ml-2">Production</span>
            </div>
            <div>
              <span className="text-slate-400">Branch:</span>
              <span className="text-slate-100 ml-2">main</span>
            </div>
            <div>
              <span className="text-slate-400">Commit:</span>
              <span className="text-slate-100 ml-2 font-mono">abc123f</span>
            </div>
            <div>
              <span className="text-slate-400">Last Deploy:</span>
              <span className="text-slate-100 ml-2">Never</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeploymentPipeline;
