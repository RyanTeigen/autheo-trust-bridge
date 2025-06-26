
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { decryptWithKey, getUserEncryptionKey } from '@/utils/crypto/export';
import { useAuth } from '@/contexts/AuthContext';
import { MedicalRecordsService } from '@/services/MedicalRecordsService';

interface ImportRecordButtonProps {
  onImportSuccess?: () => void;
  className?: string;
}

export function ImportRecordButton({ 
  onImportSuccess,
  className 
}: ImportRecordButtonProps) {
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setImporting(true);

    try {
      // Get user's encryption key
      const userKey = getUserEncryptionKey();
      
      // Read file content
      const fileContent = await file.text();
      
      // Decrypt the file content
      const decryptedData = decryptWithKey(fileContent, userKey);
      const parsedRecord = JSON.parse(decryptedData);
      
      // Validate the record structure
      if (!parsedRecord.title && !parsedRecord.data) {
        throw new Error('Invalid record format');
      }
      
      // Prepare record data for import
      const recordData = {
        title: parsedRecord.title || 'Imported Record',
        description: parsedRecord.description || 'Imported from encrypted file',
        recordType: parsedRecord.recordType || 'imported',
        data: parsedRecord.data || parsedRecord,
        importedAt: new Date().toISOString(),
        originalId: parsedRecord.id // Keep reference to original ID
      };
      
      // Create the record using the medical records service
      const result = await MedicalRecordsService.createRecord(recordData, recordData.recordType);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to import record');
      }

      toast({
        title: "Import Successful",
        description: "Your medical record has been imported and encrypted securely.",
      });

      // Call success callback if provided
      if (onImportSuccess) {
        onImportSuccess();
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Failed to import the encrypted record',
        variant: "destructive"
      });
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".json,.enc.json"
        onChange={handleFileImport}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={importing}
      />
      <Button 
        disabled={importing}
        variant="outline"
        size="sm"
        className={className}
      >
        {importing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            Importing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            <FileText className="h-3 w-3 mr-1 opacity-75" />
            Import
          </>
        )}
      </Button>
    </div>
  );
}
