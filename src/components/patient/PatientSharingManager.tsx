import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, ShieldOff, Loader2, AlertTriangle } from 'lucide-react';

interface SharingPermission {
  id: string;
  grantee_id: string;
  status: string;
  permission_type: string;
  created_at: string;
  medical_record_id: string;
  expires_at?: string;
}

export default function PatientSharingManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<SharingPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchPermissions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          grantee_id,
          status,
          permission_type,
          created_at,
          medical_record_id,
          expires_at
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching permissions:', error);
        toast({
          title: "Error",
          description: "Failed to load sharing permissions",
          variant: "destructive"
        });
      } else {
        setPermissions(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async (permissionId: string) => {
    setRevokingId(permissionId);
    try {
      const { error } = await supabase.rpc('revoke_sharing_permission', { 
        permission_id: permissionId 
      });

      if (error) {
        console.error('Error revoking permission:', error);
        toast({
          title: "Error",
          description: "Failed to revoke access permission",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Access permission has been revoked",
        });
        fetchPermissions(); // Refresh the list
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setRevokingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5"></div>
            Active
          </Badge>
        );
      case 'revoked':
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20 transition-colors">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></div>
            Revoked
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20 transition-colors">
            <div className="w-2 h-2 bg-amber-500 rounded-full mr-1.5"></div>
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPermissions();
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <TooltipProvider>
      <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Shield className="h-5 w-5" />
          Record Sharing Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-autheo-primary" />
            <span className="ml-2 text-slate-400">Loading permissions...</span>
          </div>
        ) : permissions.length === 0 ? (
          <div className="text-center py-8">
            <ShieldOff className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">No records are currently shared with providers</p>
          </div>
        ) : (
          <div className="space-y-3">
            {permissions.map((permission) => (
              <div
                key={permission.id}
                className={`
                  flex items-center justify-between p-5 rounded-lg border transition-all duration-200 hover:scale-[1.01]
                  ${permission.status === 'approved' 
                    ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700/70 hover:border-slate-600/70' 
                    : 'bg-slate-800/80 border-slate-700/80 opacity-75'
                  }
                `}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-slate-200 font-medium">
                      Provider ID: {permission.grantee_id}
                    </p>
                    {getStatusBadge(permission.status)}
                  </div>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>Permission: {permission.permission_type}</p>
                    <p>Created: {new Date(permission.created_at).toLocaleDateString()}</p>
                    {permission.expires_at && (
                      <p>Expires: {new Date(permission.expires_at).toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
                
                {permission.status === 'approved' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => revokeAccess(permission.id)}
                        disabled={revokingId === permission.id}
                        variant="destructive"
                        size="sm"
                        className="ml-4 hover:scale-105 transition-transform"
                      >
                        {revokingId === permission.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Revoking...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Revoke Access
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Permanently revoke this provider's access to your records</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}