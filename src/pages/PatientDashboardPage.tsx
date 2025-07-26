
import React, { useState, useEffect } from 'react';
import { Heart, Download, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/dashboard/PageHeader';
import RevampedDashboardTabs from '@/components/patient-dashboard/RevampedDashboardTabs';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import IncidentReportModal from '@/components/compliance/IncidentReportModal';
import PolicyAcknowledgmentModal from '@/components/patient/PolicyAcknowledgmentModal';
import NotificationDrivenApprovalAlert from '@/components/patient/NotificationDrivenApprovalAlert';
import { EnhancedNotificationCenter } from '@/components/notifications/EnhancedNotificationCenter';
import { NotificationDemoCreator } from '@/components/demo/NotificationDemoCreator';


const PatientDashboardPage = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [exportLoading, setExportLoading] = useState(false);
  const [realTimeConnected, setRealTimeConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Real-time connection setup
  useEffect(() => {
    if (session?.access_token) {
      // Simulate real-time connection (WebSocket would be implemented here)
      setRealTimeConnected(true);
      
      // Setup real-time subscription to patient notifications
      const subscription = supabase
        .channel('patient_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'patient_notifications',
            filter: `patient_id=eq.${user?.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev]);
            toast({
              title: "New Notification",
              description: payload.new.title || "You have a new notification",
            });
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [session, user, toast]);

  const handleToggleShare = (id: string, shared: boolean) => {
    console.log('Toggle share for record:', id, 'to', shared);
    // Implementation would go here
  };

  const handleShareHealthInfo = () => {
    console.log('Share health info');
    // Implementation would go here
  };

  const handleExportRecords = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to export your records.",
        variant: "destructive"
      });
      return;
    }

    setExportLoading(true);
    try {
      // Call the edge function for secure export
      const { data, error } = await supabase.functions.invoke('export_records');

      if (error) throw error;

      // Create and trigger file download
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `health-records-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Successfully exported ${data.length} approved medical records.`,
      });

    } catch (error) {
      console.error('Error exporting records:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Failed to export records',
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Show authentication prompt if user is not logged in
  if (!user) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Health Dashboard"
          description="Your personal health management platform with quantum-safe sharing and comprehensive health tracking"
          icon={<Heart className="h-8 w-8 text-autheo-primary" />}
        />
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <Alert className="border-amber-500/30 bg-amber-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-slate-200">
                Please log in to access your health dashboard and medical records.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PolicyAcknowledgmentModal />
      
      {/* Prominent Approval Alerts */}
      <NotificationDrivenApprovalAlert />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <PageHeader
            title="My Health Dashboard"
            description="Your personal health management platform with quantum-safe sharing and comprehensive health tracking"
            icon={<Heart className="h-8 w-8 text-autheo-primary" />}
          />
          {/* Real-time connection status */}
          <div className="flex items-center gap-2 mt-2">
            {realTimeConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <Badge variant="outline" className="text-green-500 border-green-500">
                  Real-time Connected
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <Badge variant="outline" className="text-red-500 border-red-500">
                  Offline Mode
                </Badge>
              </>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <IncidentReportModal />
          <Button 
            onClick={handleExportRecords}
            disabled={exportLoading}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            {exportLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-autheo-primary mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download My Records
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Enhanced Notification System */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EnhancedNotificationCenter />
        </div>
        <div className="space-y-6">
          <NotificationDemoCreator />
        </div>
      </div>
      
      <RevampedDashboardTabs
        handleToggleShare={handleToggleShare}
        handleShareHealthInfo={handleShareHealthInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
    </div>
  );
};

export default PatientDashboardPage;
