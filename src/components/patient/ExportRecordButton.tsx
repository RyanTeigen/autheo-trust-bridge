
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserEncryptionKey } from '@/utils/crypto/export';
import { useAuth } from '@/contexts/AuthContext';

interface ExportRecordButtonProps {
  recordId: string;
  recordType?: string;
  className?: string;
}

export function ExportRecordButton({ 
  recordId, 
  recordType = 'Medical Record',
  className 
}: ExportRecordButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();
  const { user, session } = useAuth();

  const exportRecord = async () => {
    if (!user || !session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to export records",
        variant: "destructive"
      });
      return;
    }

    setDownloading(true);

    try {
      // Get or generate user encryption key
      const userKey = getUserEncryptionKey();
      
      // Make API request to export endpoint
      const response = await fetch(
        `/api/records/export?recordId=${recordId}&userKey=${userKey}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Export failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Export failed');
      }

      // Create downloadable file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical-record-${recordId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.enc.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `${recordType} has been encrypted and downloaded securely.`,
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button 
      onClick={exportRecord} 
      disabled={downloading}
      variant="outline"
      size="sm"
      className={className}
    >
      {downloading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          <Lock className="h-3 w-3 mr-1 opacity-75" />
          Export
        </>
      )}
    </Button>
  );
}
