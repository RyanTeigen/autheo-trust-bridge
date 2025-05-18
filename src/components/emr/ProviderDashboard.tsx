
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Stethoscope, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ProviderDashboard: React.FC = () => {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Feature in Development",
      description: "This provider feature will be available soon.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Provider Dashboard</CardTitle>
        <CardDescription>
          Manage patient records and clinical workflows
        </CardDescription>
      
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
                <p className="text-xs max-w-[200px]">HIPAA compliant schedule with zero-knowledge encryption</p>
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
                <p className="text-xs max-w-[200px]">Integrates with EHR and clinical documentation systems</p>
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
                <p className="text-xs max-w-[200px]">Automatically notifies patients of upcoming appointments</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleAction}>Schedule Appointment</Button>
          <Button onClick={handleAction} variant="outline">View Patient Queue</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderDashboard;
