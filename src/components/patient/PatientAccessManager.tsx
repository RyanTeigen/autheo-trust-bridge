import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Shield, ShieldOff } from 'lucide-react'

interface SharingPermission {
  id: string
  medical_record_id: string
  grantee_id: string
  permission_type: string
  status: string
  created_at: string
  expires_at?: string
  revoked_reason?: string
  revoked_at?: string
}

export default function PatientAccessManager() {
  const [sharedRecords, setSharedRecords] = useState<SharingPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const { toast } = useToast()

  const fetchSharedRecords = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to view shared records",
        variant: "destructive"
      })
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('sharing_permissions')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading shared records:', error)
      toast({
        title: "Error",
        description: "Failed to load shared records",
        variant: "destructive"
      })
    } else {
      setSharedRecords(data || [])
    }

    setLoading(false)
  }

  const revokeAccess = async (recordId: string) => {
    setRevoking(recordId)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to revoke access",
          variant: "destructive"
        })
        return
      }

      const response = await supabase.functions.invoke('revoke_sharing', {
        body: { 
          record_id: recordId, 
          reason: reason.trim() || null 
        }
      })

      if (response.error) {
        throw response.error
      }

      toast({
        title: "Success",
        description: "Access revoked successfully"
      })
      
      setReason('')
      await fetchSharedRecords()
    } catch (error: any) {
      console.error('Error revoking access:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to revoke access",
        variant: "destructive"
      })
    } finally {
      setRevoking(null)
    }
  }

  useEffect(() => {
    fetchSharedRecords()
  }, [])

  const activeRecords = sharedRecords.filter(record => record.status === 'active')
  const revokedRecords = sharedRecords.filter(record => record.status === 'revoked')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading shared records...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Manage Shared Access
        </h2>
        <p className="text-muted-foreground mt-1">
          View and manage who has access to your medical records
        </p>
      </div>

      {/* Active Shared Records */}
      <Card>
        <CardHeader>
          <CardTitle>Active Shared Records</CardTitle>
          <CardDescription>
            Records currently shared with healthcare providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No records are currently being shared
            </p>
          ) : (
            <div className="space-y-4">
              {activeRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Record ID:</span>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {record.medical_record_id}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Provider:</span>
                      <code className="text-xs">{record.grantee_id}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={record.permission_type === 'write' ? 'destructive' : 'secondary'}>
                        {record.permission_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Shared: {new Date(record.created_at).toLocaleDateString()}
                      </span>
                      {record.expires_at && (
                        <span className="text-xs text-muted-foreground">
                          Expires: {new Date(record.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        disabled={revoking === record.medical_record_id}
                      >
                        {revoking === record.medical_record_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ShieldOff className="h-4 w-4" />
                        )}
                        Revoke Access
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Access</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to revoke access to this medical record? 
                          The provider will no longer be able to view or modify this record.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Textarea
                          id="reason"
                          placeholder="Enter a reason for revoking access..."
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setReason('')}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => revokeAccess(record.medical_record_id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Revoke Access
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revoked Records */}
      {revokedRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revoked Access History</CardTitle>
            <CardDescription>
              Previously revoked sharing permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revokedRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Record ID:</span>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {record.medical_record_id}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Provider:</span>
                      <code className="text-xs">{record.grantee_id}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Revoked</Badge>
                      <span className="text-xs text-muted-foreground">
                        Revoked: {record.revoked_at ? new Date(record.revoked_at).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                    {record.revoked_reason && (
                      <div className="text-xs text-muted-foreground">
                        Reason: {record.revoked_reason}
                      </div>
                    )}
                  </div>
                  
                  <Badge variant="secondary">
                    <ShieldOff className="h-3 w-3 mr-1" />
                    Revoked
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}