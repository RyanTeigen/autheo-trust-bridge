
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
      // Get patient record first
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) {
        throw new Error('Patient record not found');
      }

      // Fetch all approved records with specific fields as requested
      const { data: records, error } = await supabase
        .from('medical_records')
        .select(`
          id,
          record_type,
          created_at,
          provider_id,
          encrypted_data,
          sharing_permissions!medical_record_id (
            status,
            signed_consent
          ),
          anchored_hashes!record_id (
            record_hash
          )
        `)
        .or(`user_id.eq.${user.id},patient_id.eq.${patient.id}`)
        .eq('sharing_permissions.status', 'approved');

      if (error) throw error;

      // Format the output exactly as specified
      const exportData = (records || []).map(r => ({
        id: r.id,
        type: r.record_type,
        unit: 'N/A', // Will be populated from atomic data if available
        timestamp: r.created_at,
        provider_id: r.provider_id || 'self',
        encrypted_value: r.encrypted_data ? 'encrypted' : 'N/A',
        anchor_hash: r.anchored_hashes?.[0]?.record_hash || 'N/A',
        status: r.sharing_permissions?.[0]?.status || 'unknown'
      }));

      // Trigger file download as specified
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
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

      // Log the export for audit purposes
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'SECURE_EXPORT_RECORDS',
        resource: 'medical_records',
        status: 'success',
        details: `Exported ${exportData.length} approved records`,
        metadata: {
          export_format: 'json',
          records_count: exportData.length,
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "Export Successful",
        description: `Successfully exported ${exportData.length} approved medical records.`,
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
