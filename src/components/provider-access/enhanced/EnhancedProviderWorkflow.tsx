import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Shield, Building2, Clock, Zap } from 'lucide-react';
import EnhancedAccessRequestForm from './EnhancedAccessRequestForm';
import EnhancedAccessRequestsList from './EnhancedAccessRequestsList';

const EnhancedProviderWorkflow: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequestCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2 flex items-center gap-2">
          <Zap className="h-6 w-6 text-autheo-primary" />
          Enhanced Provider Workflow
        </h2>
        <p className="text-slate-400">
          Advanced access request management with cross-hospital support, urgency levels, and comprehensive tracking.
        </p>
      </div>

      <Alert className="border-autheo-primary/30 bg-autheo-primary/10">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-slate-200">
          <strong>Enhanced Features:</strong> Cross-hospital requests, urgency prioritization, automated reminders, 
          audit trails, and patient notifications with comprehensive clinical justification requirements.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="request" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
          <TabsTrigger 
            value="request" 
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-white text-slate-300"
          >
            <FileText className="h-4 w-4 mr-2" />
            New Request
          </TabsTrigger>
          <TabsTrigger 
            value="tracking" 
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-white text-slate-300"
          >
            <Clock className="h-4 w-4 mr-2" />
            Request Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="mt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <h3 className="font-medium text-slate-200">Standard Requests</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Regular patient record access for ongoing care and treatment
                </p>
              </div>
              
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  <h3 className="font-medium text-slate-200">Cross-Hospital</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Access records from patients treated at other healthcare facilities
                </p>
              </div>
              
              <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <h3 className="font-medium text-slate-200">Emergency Access</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Expedited access for critical care situations with priority processing
                </p>
              </div>
            </div>

            <EnhancedAccessRequestForm onRequestCreated={handleRequestCreated} />
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="mt-6">
          <EnhancedAccessRequestsList refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Workflow Status Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">pending</Badge>
            <span className="text-sm text-slate-400">Awaiting patient review</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">under review</Badge>
            <span className="text-sm text-slate-400">In administrative review</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">approved</Badge>
            <span className="text-sm text-slate-400">Access granted</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive">rejected</Badge>
            <span className="text-sm text-slate-400">Access denied</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProviderWorkflow;