import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Eye, EyeOff, RefreshCw, User, AlertCircle } from 'lucide-react';
import { useProviderRecords } from '@/hooks/useProviderRecords';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function ProviderRecordsTable() {
  const { records, loading, error, refetch, decryptRecord } = useProviderRecords();
  const [decryptingIds, setDecryptingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleDecryptRecord = async (recordId: string) => {
    try {
      setDecryptingIds(prev => new Set(prev).add(recordId));
      await decryptRecord(recordId);
      toast({
        title: "Record Decrypted",
        description: "The record has been successfully decrypted",
      });
    } catch (error) {
      console.error('Error decrypting record:', error);
      toast({
        title: "Decryption Failed",
        description: error instanceof Error ? error.message : "Failed to decrypt record",
        variant: "destructive",
      });
    } finally {
      setDecryptingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(recordId);
        return newSet;
      });
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'blood_pressure':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'heart_rate':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      case 'temperature':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'weight':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'height':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'allergy':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'medication':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'note':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-300';
    }
  };

  const formatRecordType = (type: string) => {
    return type?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Medical Record';
  };

  const renderDecryptedData = (record: any) => {
    if (!record.decrypted_data) return null;

    const data = record.decrypted_data;
    return (
      <div className="mt-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
        <div className="text-sm space-y-1">
          {data.title && <div><span className="font-medium">Title:</span> {data.title}</div>}
          {data.value && <div><span className="font-medium">Value:</span> {data.value}</div>}
          {data.unit && <div><span className="font-medium">Unit:</span> {data.unit}</div>}
          {data.description && <div><span className="font-medium">Description:</span> {data.description}</div>}
          {data.notes && <div><span className="font-medium">Notes:</span> {data.notes}</div>}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading records: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <FileText className="h-5 w-5" />
            My Patient Records ({records.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="border-slate-600 hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {records.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">
              No Records Created Yet
            </h3>
            <p className="text-slate-400">
              Records you create for patients will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Patient</TableHead>
                  <TableHead className="text-slate-300">Type</TableHead>
                  <TableHead className="text-slate-300">Created</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <React.Fragment key={record.id}>
                    <TableRow className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <div>
                            <div className="font-medium text-slate-200">
                              {(record as any).patients?.full_name || 'Unknown Patient'}
                            </div>
                            <div className="text-sm text-slate-400">
                              {(record as any).patients?.email || record.patient_id.slice(0, 8) + '...'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRecordTypeColor(record.record_type || 'general')}>
                          {formatRecordType(record.record_type || 'general')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {record.record_hash ? 'Secured' : 'Processing'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDecryptRecord(record.id)}
                          disabled={decryptingIds.has(record.id)}
                          className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
                        >
                          {decryptingIds.has(record.id) ? (
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          ) : record.decrypted_data ? (
                            <EyeOff className="h-4 w-4 mr-2" />
                          ) : (
                            <Eye className="h-4 w-4 mr-2" />
                          )}
                          {record.decrypted_data ? 'Hide' : 'View'}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {record.decrypted_data && (
                      <TableRow className="border-slate-700">
                        <TableCell colSpan={5} className="bg-slate-800/50">
                          {renderDecryptedData(record)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}