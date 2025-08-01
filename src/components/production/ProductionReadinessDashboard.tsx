import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { getProductionStatus, deploymentInfo } from '@/utils/deployment';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Rocket,
  Database,
  Lock,
  Activity,
  FileCheck,
  Settings,
  Globe,
  Server
} from 'lucide-react';

interface ChecklistCategory {
  title: string;
  icon: React.ReactNode;
  checks: Record<string, boolean>;
  description: string;
}

export const ProductionReadinessDashboard: React.FC = () => {
  const { toast } = useToast();
  const [productionStatus, setProductionStatus] = useState(getProductionStatus());
  const [isDeploying, setIsDeploying] = useState(false);

  const categories: ChecklistCategory[] = [
    {
      title: 'Security',
      icon: <Shield className="h-5 w-5" />,
      description: 'Security hardening and protection measures',
      checks: productionStatus.checklist.security
    },
    {
      title: 'Performance',
      icon: <Activity className="h-5 w-5" />,
      description: 'Performance optimization and monitoring',
      checks: productionStatus.checklist.performance
    },
    {
      title: 'Compliance',
      icon: <FileCheck className="h-5 w-5" />,
      description: 'Regulatory compliance and audit requirements',
      checks: productionStatus.checklist.compliance
    },
    {
      title: 'Deployment',
      icon: <Server className="h-5 w-5" />,
      description: 'Production deployment configuration',
      checks: productionStatus.checklist.deployment
    }
  ];

  const getCheckIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getCategoryScore = (checks: Record<string, boolean>) => {
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.values(checks).length;
    return Math.round((passed / total) * 100);
  };

  const getOverallStatusColor = () => {
    if (productionStatus.readinessScore >= 95) return 'text-green-500';
    if (productionStatus.readinessScore >= 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleDeploy = async () => {
    if (!productionStatus.isProductionReady) {
      toast({
        title: 'Deployment Blocked',
        description: 'Please complete all production readiness checks before deploying.',
        variant: 'destructive'
      });
      return;
    }

    setIsDeploying(true);
    
    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: 'Deployment Successful',
        description: `Autheo Trust Bridge v${deploymentInfo.version} deployed to production.`,
      });
      
      setProductionStatus(getProductionStatus());
    } catch (error) {
      toast({
        title: 'Deployment Failed',
        description: 'An error occurred during deployment. Please check logs.',
        variant: 'destructive'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const refreshStatus = () => {
    setProductionStatus(getProductionStatus());
    toast({
      title: 'Status Refreshed',
      description: 'Production readiness status has been updated.',
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Production Readiness</h1>
            <p className="text-slate-400">
              Autheo Trust Bridge v{deploymentInfo.version} - {deploymentInfo.environment}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={refreshStatus}
              variant="outline" 
              className="border-slate-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button 
              onClick={handleDeploy}
              disabled={!productionStatus.isProductionReady || isDeploying}
              className="bg-autheo-primary hover:bg-autheo-primary/90"
            >
              {isDeploying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy to Production
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Overall Status */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Overall Production Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold ${getOverallStatusColor()}`}>
                  {productionStatus.readinessScore}%
                </div>
                <div>
                  <p className="text-white font-semibold">
                    {productionStatus.isProductionReady ? 'Ready for Production' : 'Not Ready'}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {productionStatus.isProductionReady 
                      ? 'All critical checks passed' 
                      : 'Some checks require attention'
                    }
                  </p>
                </div>
              </div>
              <Badge 
                variant={productionStatus.isProductionReady ? 'default' : 'destructive'}
                className={productionStatus.isProductionReady ? 'bg-green-500' : ''}
              >
                {productionStatus.isProductionReady ? 'READY' : 'NOT READY'}
              </Badge>
            </div>
            <Progress 
              value={productionStatus.readinessScore} 
              className="h-3"
            />
          </CardContent>
        </Card>

        {/* Production Features */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Production Features</CardTitle>
            <CardDescription className="text-slate-400">
              Features enabled in this production build
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {deploymentInfo.features.map((feature, index) => (
                <Badge key={index} variant="outline" className="justify-center py-2">
                  {feature.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Readiness Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  {category.icon}
                  {category.title}
                  <Badge variant="outline" className="ml-auto">
                    {getCategoryScore(category.checks)}%
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {category.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(category.checks).map(([check, passed]) => (
                    <div key={check} className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">
                        {check.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      {getCheckIcon(passed)}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Progress 
                    value={getCategoryScore(category.checks)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Deployment Information */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Deployment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-slate-400 text-sm">Version</p>
                <p className="text-white font-semibold">{deploymentInfo.version}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Environment</p>
                <p className="text-white font-semibold capitalize">{deploymentInfo.environment}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Commit Hash</p>
                <p className="text-white font-semibold font-mono text-sm">
                  {deploymentInfo.commitHash}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Warnings */}
        {!productionStatus.isProductionReady && (
          <Alert className="bg-red-900/20 border-red-600">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-red-400">Production Deployment Blocked</AlertTitle>
            <AlertDescription className="text-red-300">
              Complete all readiness checks before deploying to production. 
              Ensure all security, performance, and compliance requirements are met.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ProductionReadinessDashboard;