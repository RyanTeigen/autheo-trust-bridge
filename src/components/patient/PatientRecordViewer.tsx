
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, FileText, Calendar, User, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SharedRecord {
  id: string;
  patient_id: string;
  provider_id: string;
  type: string;
  value: string;
  unit: string;
  recorded_at: string;
}

export const PatientRecordViewer: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<SharedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  useEffect(() => {
    if (user) {
      fetchPatientRecords();
    }
  }, [user]);

  const fetchPatientRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Call the Supabase function to get shared patient records
      const { data: sharedRecords, error: fetchError } = await supabase
        .rpc('get_patient_records', { current_user_id: user.id });

      if (fetchError) {
        throw fetchError;
      }

      setRecords(sharedRecords || []);
    } catch (err) {
      console.error('Error fetching patient records:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'blood_pressure':
        return 'bg-red-100 text-red-800';
      case 'heart_rate':
        return 'bg-pink-100 text-pink-800';
      case 'temperature':
        return 'bg-orange-100 text-orange-800';
      case 'weight':
        return 'bg-blue-100 text-blue-800';
      case 'height':
        return 'bg-green-100 text-green-800';
      case 'allergy':
        return 'bg-yellow-100 text-yellow-800';
      case 'medication':
        return 'bg-purple-100 text-purple-800';
      case 'note':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const formatRecordType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const renderRecordValue = (record: SharedRecord) => {
    if (record.value && record.unit) {
      return `${record.value} ${record.unit}`;
    }
    return record.value || 'No data';
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please log in to view your medical records.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">My Medical Records</h2>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading medical records: {error}
        </AlertDescription>
      </Alert>
    );
  }

  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>
                  <Badge className={getRecordTypeColor(record.type)}>
                    {formatRecordType(record.type)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="text-sm truncate">
                    {renderRecordValue(record)}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(record.recorded_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {record.id.slice(0, 8)}...
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderCardView = () => (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {formatRecordType(record.type)}
              </CardTitle>
              <Badge className={getRecordTypeColor(record.type)}>
                {formatRecordType(record.type)}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(record.recorded_at), 'MMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                Record ID: {record.id.slice(0, 8)}...
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Record Data:</h4>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {renderRecordValue(record)}
              </pre>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">My Medical Records</h2>
        </div>
        {records.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Table
            </Button>
          </div>
        )}
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Medical Records Found
            </h3>
            <p className="text-gray-500">
              You don't have any medical records yet. Records will appear here once they are created.
            </p>
          </CardContent>
        </Card>
      ) : (
        viewMode === 'table' ? renderTableView() : renderCardView()
      )}
    </div>
  );
};

export default PatientRecordViewer;
