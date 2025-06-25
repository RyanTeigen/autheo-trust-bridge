
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Permission = {
  id: string;
  medical_record_id: string;
  grantee_id: string;
  permission_type: string;
  created_at: string;
  expires_at?: string;
  access_revoked?: boolean;
  grantee_name?: string;
  record_title?: string;
};

interface SharingManagerProps {
  userId?: string;
}

export default function SharingManager({ userId }: SharingManagerProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const currentUserId = userId || user?.id;

  const loadPermissions = async () => {
    if (!currentUserId) return;
    
    setLoading(true);
    try {
      // Get sharing permissions with provider names
      const { data: sharingData, error } = await supabase
        .from('sharing_permissions')
        .select(`
          id,
          medical_record_id,
          grantee_id,
          permission_type,
          created_at,
          expires_at,
          profiles!sharing_permissions_grantee_id_fkey (
            first_name,
            last_name
          ),
          medical_records (
            record_type
          )
        `)
        .eq('patient_id', currentUserId);

      if (error) {
        console.error('Error loading permissions:', error);
        return;
      }

      // Transform data to include names
      const transformedPermissions = sharingData?.map(permission => ({
        ...permission,
        grantee_name: permission.profiles 
          ? `${(permission.profiles as any).first_name || ''} ${(permission.profiles as any).last_name || ''}`.trim()
          : 'Unknown Provider',
        record_title: (permission.medical_records as any)?.record_type || 'Medical Record',
        access_revoked: false // Default to not revoked for existing records
      })) || [];

      setPermissions(transformedPermissions);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load sharing permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAccess = async (permissionId: string, shouldRevoke: boolean) => {
    try {
      if (shouldRevoke) {
        // For permanent revocation, we delete the permission
        const { error } = await supabase
          .from('sharing_permissions')
          .delete()
          .eq('id', permissionId);

        if (error) throw error;

        // Log the revocation in audit logs
        await supabase.from('audit_logs').insert({
          user_id: currentUserId,
          action: 'REVOKE_SHARING_PERMISSION',
          resource: 'sharing_permission',
          resource_id: permissionId,
          status: 'success',
          details: 'Sharing permission revoked by patient'
        });

        toast({
          title: "Access Revoked",
          description: "Provider access has been permanently revoked",
        });
      } else {
        // For re-enabling, we would need to recreate the permission
        // This is more complex as we'd need to store the original permission details
        toast({
          title: "Re-enable Access",
          description: "Please use the sharing dialog to grant access again",
        });
      }

      // Reload permissions
      await loadPermissions();
    } catch (error) {
      console.error('Error toggling access:', error);
      toast({
        title: "Error",
        description: "Failed to update access permissions",
        variant: "destructive"
      });
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  useEffect(() => {
    if (currentUserId) {
      loadPermissions();
    }
  }, [currentUserId]);

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-16 bg-slate-700 rounded"></div>
              <div className="h-16 bg-slate-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <Users className="h-5 w-5 text-autheo-primary" />
          Active Sharing Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permissions.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active sharing permissions</p>
            <p className="text-sm">Records you share will appear here</p>
          </div>
        ) : (
          permissions.map(permission => (
            <div 
              key={permission.id} 
              className="flex justify-between items-center border border-slate-600 p-4 rounded-lg bg-slate-700/30"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-slate-200">
                    {permission.grantee_name || 'Unknown Provider'}
                  </h4>
                  <Badge 
                    variant={isExpired(permission.expires_at) ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {permission.permission_type}
                  </Badge>
                </div>
                
                <div className="text-sm text-slate-400">
                  Record: {permission.record_title}
                </div>
                
                <div className="text-xs text-slate-500">
                  Granted: {new Date(permission.created_at).toLocaleDateString()}
                  {permission.expires_at && (
                    <>
                      {' • Expires: '}
                      {new Date(permission.expires_at).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isExpired(permission.expires_at) ? (
                    <>
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <span className="text-sm text-orange-400">Expired</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">Active</span>
                    </>
                  )}
                </div>
                
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => toggleAccess(permission.id, true)}
                  disabled={isExpired(permission.expires_at)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Revoke
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
