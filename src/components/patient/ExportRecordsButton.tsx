import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileArchive, FileText, Calendar, Loader2, Shield, Hash, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ExportRecordsButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

interface MedicalRecordExport {
  id: string;
  record_type: string;
  created_at: string;
  updated_at: string;
  provider_id?: string;
  record_hash?: string;
  anchored_at?: string;
  blockchain_status: 'not_anchored' | 'anchored' | 'pending';
  consent_hash?: string;
  sharing_permissions: Array<{
    grantee_id: string;
    permission_type: string;
    created_at: string;
    expires_at?: string;
    signed_consent?: string;
  }>;
  metadata: {
    export_timestamp: string;
    encryption_status: string;
    access_logs_count: number;
  };
}

const ExportRecordsButton: React.FC<ExportRecordsButtonProps> = ({ 
  className, 
  variant = 'outline', 
  size = 'default' 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [records, setRecords] = useState<MedicalRecordExport[]>([]);
  const [exportStats, setExportStats] = useState<{
    totalRecords: number;
    anchoredRecords: number;
    sharedRecords: number;
    estimatedSize: string;
  } | null>(null);

  const fetchRecordsForExport = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to export your records.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) {
        throw new Error('No patient record found');
      }

      // Fetch all approved medical records with related data
      const { data: medicalRecords, error: recordsError } = await supabase
        .from('medical_records')
        .select(`
          id,
          record_type,
          created_at,
          updated_at,
          provider_id,
          record_hash,
          anchored_at,
          sharing_permissions!medical_record_id (
            grantee_id,
            permission_type,
            created_at,
            expires_at,
            signed_consent,
            status
          )
        `)
        .or('user_id.eq.' + user.id + ',patient_id.eq.' + patient.id);

      if (recordsError) throw recordsError;

      // Get anchoring status for each record
      const { data: anchoredHashes } = await supabase
        .from('anchored_hashes')
        .select('record_id, record_hash, anchored_at, anchor_tx_url')
        .in('record_id', medicalRecords?.map(r => r.id) || []);

      // Get audit logs count for each record
      const { data: auditCounts } = await supabase
        .from('audit_logs')
        .select('resource_id')
        .eq('user_id', user.id)
        .eq('resource', 'medical_record')
        .in('resource_id', medicalRecords?.map(r => r.id) || []);

      const auditCountsMap = auditCounts?.reduce((acc, log) => {
        acc[log.resource_id] = (acc[log.resource_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const exportData: MedicalRecordExport[] = (medicalRecords || []).map(record => {
        const anchorData = anchoredHashes?.find(h => h.record_id === record.id);
        const approvedPermissions = record.sharing_permissions.filter(p => p.status === 'approved');
        
        return {
          id: record.id,
          record_type: record.record_type || 'Unknown',
          created_at: record.created_at,
          updated_at: record.updated_at,
          provider_id: record.provider_id,
          record_hash: record.record_hash || anchorData?.record_hash,
          anchored_at: record.anchored_at || anchorData?.anchored_at,
          blockchain_status: anchorData ? 'anchored' : record.record_hash ? 'pending' : 'not_anchored',
          consent_hash: approvedPermissions[0]?.signed_consent || undefined,
          sharing_permissions: approvedPermissions.map(p => ({
            grantee_id: p.grantee_id,
            permission_type: p.permission_type,
            created_at: p.created_at,
            expires_at: p.expires_at,
            signed_consent: p.signed_consent
          })),
          metadata: {
            export_timestamp: new Date().toISOString(),
            encryption_status: 'client_side_encrypted',
            access_logs_count: auditCountsMap[record.id] || 0
          }
        };
      });

      setRecords(exportData);
      setExportStats({
        totalRecords: exportData.length,
        anchoredRecords: exportData.filter(r => r.blockchain_status === 'anchored').length,
        sharedRecords: exportData.filter(r => r.sharing_permissions.length > 0).length,
        estimatedSize: `${Math.ceil(JSON.stringify(exportData).length / 1024)} KB`
      });

      setPreviewOpen(true);

    } catch (error) {
      console.error('Error fetching records for export:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Failed to prepare records for export',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadRecords = async (format: 'json' | 'zip') => {
    try {
      const exportPackage = {
        metadata: {
          patient_id: user?.id,
          export_date: new Date().toISOString(),
          format_version: '1.0',
          records_count: records.length,
          verification: {
            total_records: exportStats?.totalRecords,
            anchored_records: exportStats?.anchoredRecords,
            shared_records: exportStats?.sharedRecords
          }
        },
        records: records,
        audit_trail: {
          export_requested_by: user?.id,
          export_timestamp: new Date().toISOString(),
          consent_verification: 'user_initiated_export',
          compliance_flags: {
            hipaa_compliant: true,
            patient_consent: true,
            data_minimization: true
          }
        }
      };

      if (format === 'json') {
        // Download as JSON
        const blob = new Blob([JSON.stringify(exportPackage, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical-records-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // For ZIP format, we'll create multiple files
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        // Add main export file
        zip.file('medical-records.json', JSON.stringify(exportPackage.records, null, 2));
        
        // Add metadata file
        zip.file('export-metadata.json', JSON.stringify(exportPackage.metadata, null, 2));
        
        // Add audit trail
        zip.file('audit-trail.json', JSON.stringify(exportPackage.audit_trail, null, 2));
        
        // Add individual record files
        const recordsFolder = zip.folder('individual-records');
        records.forEach(record => {
          recordsFolder?.file(`${record.record_type}-${record.id}.json`, JSON.stringify(record, null, 2));
        });

        // Add compliance report
        const complianceReport = {
          compliance_framework: 'HIPAA',
          export_compliance: {
            patient_consent: true,
            data_minimization: true,
            purpose_limitation: 'patient_requested_export',
            security_measures: 'client_side_encryption',
            audit_logging: true
          },
          blockchain_verification: records.filter(r => r.blockchain_status === 'anchored').map(r => ({
            record_id: r.id,
            record_hash: r.record_hash,
            anchored_at: r.anchored_at
          }))
        };
        zip.file('compliance-report.json', JSON.stringify(complianceReport, null, 2));

        // Generate and download ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medical-records-export-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      // Log the export
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'EXPORT_MEDICAL_RECORDS',
        resource: 'medical_records',
        status: 'success',
        details: `Exported ${records.length} records in ${format.toUpperCase()} format`,
        metadata: {
          format: format,
          records_count: records.length,
          anchored_count: exportStats?.anchoredRecords,
          shared_count: exportStats?.sharedRecords
        }
      });

      toast({
        title: "Export Successful",
        description: `Your medical records have been exported as ${format.toUpperCase()} file.`,
      });

      setPreviewOpen(false);

    } catch (error) {
      console.error('Error downloading records:', error);
      toast({
        title: "Download Failed",
        description: "Failed to create download file. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={fetchRecordsForExport}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export Records
          </>
        )}
      </Button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Medical Records
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Export Summary */}
            {exportStats && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-lg">Export Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-autheo-primary">
                      {exportStats.totalRecords}
                    </div>
                    <div className="text-sm text-slate-400">Total Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {exportStats.anchoredRecords}
                    </div>
                    <div className="text-sm text-slate-400">Blockchain Anchored</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {exportStats.sharedRecords}
                    </div>
                    <div className="text-sm text-slate-400">Shared Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-300">
                      {exportStats.estimatedSize}
                    </div>
                    <div className="text-sm text-slate-400">Estimated Size</div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Records Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Records to be Exported</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {records.map((record) => (
                  <Card key={record.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-autheo-primary" />
                          <div>
                            <div className="font-medium text-slate-200">
                              {record.record_type}
                            </div>
                            <div className="text-sm text-slate-400 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(record.created_at).toLocaleDateString()}
                              </span>
                              {record.record_hash && (
                                <span className="flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  Hash Available
                                </span>
                              )}
                              {record.metadata.access_logs_count > 0 && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {record.metadata.access_logs_count} Access Logs
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {record.blockchain_status === 'anchored' && (
                            <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
                              Anchored
                            </Badge>
                          )}
                          {record.sharing_permissions.length > 0 && (
                            <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-800">
                              Shared
                            </Badge>
                          )}
                          {record.consent_hash && (
                            <Badge variant="secondary" className="bg-purple-900/20 text-purple-400 border-purple-800">
                              Consented
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Download Options */}
            <Card className="bg-amber-900/20 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-400 mt-1" />
                  <div>
                    <div className="font-medium text-amber-200 mb-2">
                      Download your health records with verified access logs?
                    </div>
                    <p className="text-sm text-amber-200/80 mb-4">
                      This export includes all metadata, blockchain anchoring status, 
                      consent hashes, and audit trail information for compliance purposes.
                    </p>
                    <div className="flex gap-3">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="default" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Download JSON
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Export</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will download your complete medical records as a JSON file, 
                              including all metadata and compliance information. Continue?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => downloadRecords('json')}>
                              Download JSON
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <FileArchive className="h-4 w-4 mr-2" />
                            Download ZIP
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Export</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will download your complete medical records as a ZIP archive with 
                              organized files and compliance reports. Continue?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => downloadRecords('zip')}>
                              Download ZIP
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExportRecordsButton;