
import React, { useState } from 'react';
import { Heart, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/dashboard/PageHeader';
import RevampedDashboardTabs from '@/components/patient-dashboard/RevampedDashboardTabs';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';


const PatientDashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [exportLoading, setExportLoading] = useState(false);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="My Health Dashboard"
          description="Your personal health management platform with quantum-safe sharing and comprehensive health tracking"
          icon={<Heart className="h-8 w-8 text-autheo-primary" />}
        />
        
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
