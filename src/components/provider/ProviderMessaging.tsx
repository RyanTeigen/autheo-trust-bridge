
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import SecureMessaging from '@/components/messaging/SecureMessaging';
import { Shield, Stethoscope, Users, BarChart3 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ProviderMessaging: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-autheo-primary">Secure Patient Communication</CardTitle>
              <CardDescription className="text-slate-300">
                Communicate securely with your patients through end-to-end encrypted messaging
              </CardDescription>
            </div>
            <div className="flex items-center px-3 py-1 rounded-full bg-autheo-primary/20 text-autheo-primary text-xs">
              <Shield className="h-3.5 w-3.5 mr-1" /> HIPAA Compliant
            </div>
          </div>
          
          {/* Value Multiplier Indicators */}
          <div className="flex flex-wrap gap-3 mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full cursor-help">
                    <Shield className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-slate-300">Security</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs max-w-[200px]">End-to-end encryption and PHI scanning reduce breach risk by 82%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full cursor-help">
                    <Stethoscope className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-slate-300">Clinical Workflow</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs max-w-[200px]">Integrates with EHR documentation, saving providers 37 minutes daily</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full cursor-help">
                    <Users className="h-3 w-3 text-purple-400" />
                    <span className="text-xs text-slate-300">Patient Engagement</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs max-w-[200px]">Patients with messaging access show 53% better medication adherence</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-full cursor-help">
                    <BarChart3 className="h-3 w-3 text-amber-400" />
                    <span className="text-xs text-slate-300">Analytics</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs max-w-[200px]">Monitors response times and identifies clinical patterns to improve care</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <SecureMessaging isProviderView={true} />
        </CardContent>
        <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-4 py-2 text-xs text-slate-400">
          <div className="flex items-center justify-between w-full">
            <span>All messages are cryptographically verified and audited</span>
            <span>Response SLA: 24 hours</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProviderMessaging;
