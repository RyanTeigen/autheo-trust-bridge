
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users } from 'lucide-react';
import { useRevokeAccessRequest } from '@/hooks/useRevokeAccessRequest';
import { usePendingAccessRequests } from '@/hooks/usePendingAccessRequests';

interface SharedAccess {
  id: string;
  grantee_id: string;
  provider_name?: string;
  provider_email?: string;
  permission_type: string;
  created_at: string;
}

export default function PatientSharedAccess() {
  const { user } = useAuth();
  const [sharedList, setSharedList] = useState<SharedAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const { revokeAccessRequest, loading: revokeLoading } = useRevokeAccessRequest();
  const { refetch } = usePendingAccessRequests(); // To refresh the list after revocation

  useEffect(() => {
    if (!user) return;
    
    const loadApprovedShares = async () => {
      try {
        setLoading(true);
        
        // Note: This assumes you have approved/active sharing permissions
        // You may need to adjust the status filter based on your data structure
        const { data, error } = await supabase
          .from('sharing_permissions')
          .select(`
            id,
            grantee_id,
            permission_type,
            created_at,
            status
          `)
          .eq('patient_id', user.id)
          .in('status', ['approved', 'active']); // Adjust status values as needed

        if (error) {
          console.error('Error loading shared access:', error);
          return;
        }

        // Fetch provider information for each share
        if (data && data.length > 0) {
          const sharesWithProviders = await Promise.all(
            data.map(async (share) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('first_name, last_name, email')
                .eq('id', share.grantee_id)
                .maybeSingle();

              return {
                ...share,
                provider_name: profile 
                  ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown Provider'
                  : 'Unknown Provider',
                provider_email: profile?.email || 'Unknown'
              };
            })
          );
          setSharedList(sharesWithProviders);
        } else {
          setSharedList([]);
        }
      } catch (error) {
        console.error('Error in loadApprovedShares:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApprovedShares();
  }, [user]);

  const handleRevoke = async (requestId: string) => {
    const result = await revokeAccessRequest(requestId);
    
    if (result.success) {
      // Remove the revoked item from the list
      setSharedList((prev) => prev.filter((item) => item.id !== requestId));
      // Refresh pending requests in case this affects other components
      refetch();
    }
  };

  if (!user) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <Alert className="border-amber-500/30 bg-amber-900/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-slate-200">
              Please log in to view your shared access permissions.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Active Access Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-autheo-primary"></div>
            <span className="ml-2 text-slate-300">Loading shared access...</span>
          </div>
        ) : sharedList.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 mb-2">No Active Sharing Permissions</p>
            <p className="text-slate-500 text-sm">
              You haven't granted access to any healthcare providers yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-400 text-sm mb-4">
              You have granted access to {sharedList.length} provider{sharedList.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-3">
              {sharedList.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-slate-600 p-4 rounded-lg bg-slate-700/50 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="font-medium text-slate-200">
                      {entry.provider_name}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {entry.provider_email}
                    </div>
                    <div className="text-slate-500 text-xs mt-1">
                      Permission: {entry.permission_type} • 
                      Granted: {new Date(entry.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevoke(entry.id)}
                    disabled={revokeLoading}
                    className="ml-4"
                  >
                    {revokeLoading ? 'Revoking...' : 'Revoke Access'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
