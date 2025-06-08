
import React from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import ProductionReadinessChecker from '@/components/production/ProductionReadinessChecker';
import DeploymentPipeline from '@/components/production/DeploymentPipeline';
import SecurityHardening from '@/components/production/SecurityHardening';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  Shield, 
  CheckCircle, 
  GitBranch,
  Globe,
  Monitor,
  Users,
  TrendingUp
} from 'lucide-react';
import { getEnvironment, getBuildInfo } from '@/utils/environment';

const ProductionDeploymentPage: React.FC = () => {
  const environment = getEnvironment();
  const buildInfo = getBuildInfo();
  
  const deploymentPhases = [
    {
      phase: 'Phase 1: Infrastructure Setup',
      status: 'completed',
      description: 'Environment configuration, monitoring, and security hardening',
      items: ['Production environment setup', 'SSL/TLS configuration', 'Security headers implementation']
    },
    {
      phase: 'Phase 2: Application Deployment',
      status: 'in-progress',
      description: 'Code deployment, testing, and validation',
      items: ['CI/CD pipeline setup', 'Production build optimization', 'Performance validation']
    },
    {
      phase: 'Phase 3: Go-Live Preparation',
      status: 'pending',
      description: 'Final checks, monitoring setup, and launch preparation',
      items: ['Load testing', 'Backup verification', 'Incident response procedures']
    },
    {
      phase: 'Phase 4: Post-Launch',
      status: 'pending',
      description: 'Monitoring, optimization, and scaling',
      items: ['Performance monitoring', 'User feedback collection', 'Scaling optimization']
    }
  ];
  
  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'pending':
        return <div className="h-5 w-5 border-2 border-slate-400 rounded-full" />;
      default:
        return <div className="h-5 w-5 border-2 border-slate-400 rounded-full" />;
    }
  };
  
  const getPhaseVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <PageHeader
          title="Production Deployment"
          description="Production readiness validation and deployment pipeline management"
          icon={<Rocket className="h-6 w-6" />}
        />
        
        {/* Environment Status */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Environment Status
            </CardTitle>
            <CardDescription className="text-slate-400">
              Current environment and build information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-400">Environment</div>
                <Badge variant={environment === 'production' ? 'default' : 'secondary'} className="mt-1">
                  {environment}
                </Badge>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-400">Version</div>
                <div className="font-mono text-slate-100 mt-1">{buildInfo.version}</div>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-400">Build Time</div>
                <div className="text-xs text-slate-300 mt-1">
                  {new Date(buildInfo.buildTime).toLocaleString()}
                </div>
              </div>
              <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                <div className="text-sm text-slate-400">Commit</div>
                <div className="font-mono text-slate-100 mt-1">{buildInfo.commitHash}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Deployment Phases */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Deployment Roadmap
            </CardTitle>
            <CardDescription className="text-slate-400">
              Production deployment phases and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deploymentPhases.map((phase, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-slate-700/50 border border-slate-600"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 mt-1">
                    {getPhaseIcon(phase.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-100">{phase.phase}</h3>
                      <Badge variant={getPhaseVariant(phase.status)} className="capitalize">
                        {phase.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">{phase.description}</p>
                    <ul className="text-sm text-slate-300 space-y-1">
                      {phase.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Main Deployment Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <ProductionReadinessChecker />
            <SecurityHardening />
          </div>
          <div className="space-y-8">
            <DeploymentPipeline />
            
            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Common deployment and monitoring tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <GitBranch className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Shield className="h-4 w-4 mr-2" />
                    Security Scan
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Performance
                  </Button>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Users className="h-4 w-4 mr-2" />
                    User Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDeploymentPage;
