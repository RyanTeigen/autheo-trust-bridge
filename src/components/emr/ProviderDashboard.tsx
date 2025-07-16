
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, Stethoscope, Users, FolderOpen } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ProviderSharedRecordsView from '@/components/provider/ProviderSharedRecordsView';

const ProviderDashboard: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const handleAction = () => {
    toast({
      title: "Feature in Development",
      description: "This provider feature will be available soon.",
    });
  };

  return (
    <div className="space-y-6">
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
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border-b border-slate-700">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
          >
            <Stethoscope className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="shared-records"
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-autheo-dark flex items-center gap-1.5"
          >
            <FolderOpen className="h-4 w-4" />
            Shared Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={handleAction}>Schedule Appointment</Button>
                <Button onClick={handleAction} variant="outline">View Patient Queue</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared-records">
          <ProviderSharedRecordsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderDashboard;
