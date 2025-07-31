import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Users, FileText, Clock, AlertTriangle, Anchor, Pill } from 'lucide-react';
import ProviderConsentAudit from '@/components/provider/ProviderConsentAudit';
import PrescriptionManagement from '@/components/provider/PrescriptionManagement';
import { processAnchorQueue, retryFailedAnchors } from '@/utils/testnetAnchoring';
import { useToast } from '@/hooks/use-toast';

const ProviderDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const { toast } = useToast();

  const handleProcessAnchorQueue = async () => {
    try {
      setIsProcessingQueue(true);
      await processAnchorQueue();
      toast({
        title: "Queue Processed",
        description: "Blockchain anchor queue has been processed successfully",
      });
    } catch (error) {
      console.error('Error processing anchor queue:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process anchor queue",
        variant: "destructive",
      });
    } finally {
      setIsProcessingQueue(false);
    }
  };

  const handleRetryFailed = async () => {
    try {
      setIsProcessingQueue(true);
      await retryFailedAnchors();
      toast({
        title: "Retries Completed",
        description: "Failed anchor items have been retried",
      });
    } catch (error) {
      console.error('Error retrying failed anchors:', error);
      toast({
        title: "Retry Failed",
        description: "Failed to retry anchor queue items",
        variant: "destructive",
      });
    } finally {
      setIsProcessingQueue(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Provider Dashboard</h1>
        <p className="text-slate-400">
          Manage patient consent records, audit blockchain anchoring, and monitor compliance
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="h-5 w-5" />
            Blockchain Operations
          </CardTitle>
          <CardDescription>
            Manage blockchain anchoring and testnet operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button 
              onClick={handleProcessAnchorQueue}
              disabled={isProcessingQueue}
              className="flex items-center gap-2"
            >
              <Anchor className="h-4 w-4" />
              {isProcessingQueue ? "Processing..." : "Process Anchor Queue"}
            </Button>
            <Button 
              variant="outline"
              onClick={handleRetryFailed}
              disabled={isProcessingQueue}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Retry Failed Anchors
            </Button>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            Manually trigger blockchain anchoring operations for pending consent records
          </p>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="prescriptions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prescriptions" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger value="consent-audit" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Consent Audit
          </TabsTrigger>
          <TabsTrigger value="patient-access" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Patient Access
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Medical Records
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-4">
          <PrescriptionManagement />
        </TabsContent>

        <TabsContent value="consent-audit" className="space-y-4">
          <ProviderConsentAudit />
        </TabsContent>

        <TabsContent value="patient-access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Access Management</CardTitle>
              <CardDescription>
                View and manage patient access permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Patient access management coming soon</p>
                <p className="text-sm text-slate-500 mt-2">
                  This will show active patient permissions and access requests
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical Records Overview</CardTitle>
              <CardDescription>
                View medical records you have access to
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Medical records view coming soon</p>
                <p className="text-sm text-slate-500 mt-2">
                  This will display medical records shared with your provider account
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Provider Analytics</CardTitle>
              <CardDescription>
                Analytics and insights for your provider activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Analytics dashboard coming soon</p>
                <p className="text-sm text-slate-500 mt-2">
                  This will show consent trends, access patterns, and compliance metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderDashboardPage;