
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Shield, Clock, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExportMetadata {
  hash: string;
  timestamp: string;
  totalRecords: number;
}

const ExportAuditLogsButton: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [lastExport, setLastExport] = useState<ExportMetadata | null>(null);
  const { toast } = useToast();

  const downloadAuditLogs = async () => {
    setDownloading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please log in to export audit logs.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`https://ilhzzroafedbyttdfypf.supabase.co/functions/v1/export_audit_log`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to export audit logs');
      }

      // Extract metadata from headers
      const hash = response.headers.get('X-Audit-Hash');
      const exportTimestamp = response.headers.get('X-Export-Timestamp');
      const totalRecords = response.headers.get('X-Total-Records');

      // Get the CSV data
      const csvBlob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(csvBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use timestamp from header for filename
      const timestamp = exportTimestamp ? 
        new Date(exportTimestamp).toISOString().replace(/[:.]/g, '-') : 
        new Date().toISOString().replace(/[:.]/g, '-');
      
      link.download = `audit_logs_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Store export metadata
      if (hash && exportTimestamp && totalRecords) {
        setLastExport({
          hash,
          timestamp: exportTimestamp,
          totalRecords: parseInt(totalRecords, 10)
        });
      }

      toast({
        title: "Export Successful", 
        description: `Successfully exported ${totalRecords || 'unknown'} audit log records.`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export audit logs",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={downloadAuditLogs}
        disabled={downloading}
        className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
      >
        <Download className="h-4 w-4 mr-2" />
        {downloading ? 'Exporting...' : 'Export Audit Logs'}
      </Button>

      {lastExport && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Last Export Integrity</span>
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <Hash className="h-3 w-3 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-400">SHA-256 Hash:</p>
                    <p className="text-autheo-primary font-mono break-all">{lastExport.hash}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-400">
                    Exported: {new Date(lastExport.timestamp).toLocaleString()}
                  </span>
                </div>
                
                <div className="text-slate-400">
                  Records: {lastExport.totalRecords.toLocaleString()}
                </div>
              </div>
              
              <p className="text-xs text-slate-500 mt-2">
                Use the SHA-256 hash to verify file integrity and detect any tampering with the exported data.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExportAuditLogsButton;
