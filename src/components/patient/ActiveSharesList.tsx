import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Share2, 
  UserCheck, 
  Calendar,
  AlertTriangle,
  Shield,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuditLog } from '@/hooks/useAuditLog';

interface SharedRecord {
  id: string;
  medical_record_id: string;
  grantee_id: string;
  permission_type: string;
  created_at: string;
  expires_at: string | null;
  record_type?: string;
  record_title?: string;
  provider_name?: string;
  provider_email?: string;
}

const ActiveSharesList: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { logCustomEvent } = useAuditLog();
  const [sharedRecords, setSharedRecords] = useState<SharedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSharedRecords();
    }
  }, [user]);

  // Helper function to generate readable titles from record type
  const generateRecordTitle = (recordType: string, createdAt: string) => {
    const formatType = (type: string) => {
      return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const formattedType = formatType(recordType);
    const date = new Date(createdAt).toLocaleDateString();
    return `${formattedType} - ${date}`;
  };

  const fetchSharedRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get patient ID first
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (patientError) {
        console.error('Error fetching patient:', patientError);
        throw patientError;
      }

      if (!patient) {
        console.warn('No patient record found for user');
        setSharedRecords([]);
        return;
      }

      // Fetch approved sharing permissions with related data
      const { data: permissions, error } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          medical_record_id,
          grantee_id,
          permission_type,
          created_at,
          expires_at,
          medical_records!inner (
            record_type,
            created_at
          )
        `)
        .eq('patient_id', patient.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get provider information for each permission
      const permissionsWithProviders = await Promise.all(
        (permissions || []).map(async (permission) => {
          const { data: provider } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', permission.grantee_id)
            .maybeSingle();

          const medicalRecord = (permission as any).medical_records;
          const recordType = medicalRecord?.record_type || 'unknown';
          const recordCreatedAt = medicalRecord?.created_at || permission.created_at;

          return {
            ...permission,
            record_type: recordType,
            record_title: generateRecordTitle(recordType, recordCreatedAt),
            provider_name: provider ? 
              `${provider.first_name || ''} ${provider.last_name || ''}`.trim() || 
              provider.email : 
              'Unknown Provider',
            provider_email: provider?.email || permission.grantee_id
          };
        })
      );

      setSharedRecords(permissionsWithProviders);

    } catch (error) {
      console.error('Error fetching shared records:', error);
      toast({
        title: "Error",
        description: "Failed to load shared records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (permissionId: string, recordTitle: string, providerName: string) => {
    try {
      setRevoking(permissionId);

      // Update sharing permission status to 'revoked'
      const { error } = await supabase
        .from('sharing_permissions')
        .update({ 
          status: 'revoked',
          responded_at: new Date().toISOString()
        })
        .eq('id', permissionId);

      if (error) throw error;

      // Log audit entry
      await logCustomEvent(
        'REVOKE_ACCESS',
        'sharing_permissions',
        'success',
        permissionId,
        `Revoked access to "${recordTitle}" for provider: ${providerName}`
      );

      toast({
        title: "Access Revoked",
        description: `Successfully revoked access to "${recordTitle}" for ${providerName}`,
      });

      // Refresh the list
      await fetchSharedRecords();

    } catch (error) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: "Failed to revoke access. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-autheo-primary" />
            My Shared Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-slate-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-autheo-primary" />
            My Shared Records
          </CardTitle>
          <CardDescription>
            Records you've shared with healthcare providers and their access status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sharedRecords.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-16 w-16 mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-medium text-slate-200 mb-2">No Shared Records</h3>
              <p className="text-slate-400">
                You haven't shared any medical records with providers yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Record</TableHead>
                    <TableHead className="text-slate-300">Shared With</TableHead>
                    <TableHead className="text-slate-300">Permission</TableHead>
                    <TableHead className="text-slate-300">Shared Date</TableHead>
                    <TableHead className="text-slate-300">Expires</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedRecords.map((record) => (
                    <TableRow key={record.id} className="border-slate-700 hover:bg-slate-750">
                      <TableCell className="text-slate-200">
                        <div>
                          <div className="font-medium">{record.record_title}</div>
                          <div className="text-sm text-slate-400 capitalize">
                            {record.record_type.replace('_', ' ')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div>
                          <div className="font-medium">{record.provider_name}</div>
                          <div className="text-sm text-slate-400">{record.provider_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.permission_type === 'write' ? 'destructive' : 'default'}
                          className={
                            record.permission_type === 'write' 
                              ? 'bg-amber-900/20 text-amber-400 border-amber-800'
                              : 'bg-green-900/20 text-green-400 border-green-800'
                          }
                        >
                          {record.permission_type === 'write' ? 'Read/Write' : 'Read Only'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(record.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {record.expires_at ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(record.expires_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-600/20 text-slate-400 border-slate-600">
                            Never
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeAccess(
                            record.id, 
                            record.record_title, 
                            record.provider_name
                          )}
                          disabled={revoking === record.id}
                          className="bg-red-900/20 text-red-400 border-red-800 hover:bg-red-900/40"
                        >
                          {revoking === record.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-400 mr-1"></div>
                          ) : (
                            <X className="h-3 w-3 mr-1" />
                          )}
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {sharedRecords.length > 0 && (
        <Alert className="bg-amber-900/20 border-amber-500/30">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-amber-200">
            <strong>Important:</strong> Revoking access will immediately prevent the provider from accessing your medical records. 
            This action cannot be undone, but you can re-share records if needed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ActiveSharesList;