import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, ShieldOff, AlertTriangle } from 'lucide-react'

interface SharedRecord {
  id: string
  medical_record_id: string
  patient_id: string
  permission_type: string
  status: string
  created_at: string
  expires_at?: string
  revoked_reason?: string
  revoked_at?: string
}

export default function ProviderSharedRecordsView() {
  const [sharedRecords, setSharedRecords] = useState<SharedRecord[]>([])
  const [loading, setLoading] = useState(true)
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
      .eq('grantee_id', user.id)
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
          Patient Records Shared With You
        </h2>
        <p className="text-muted-foreground mt-1">
          Medical records that patients have granted you access to
        </p>
      </div>

      {/* Alert for revoked records */}
      {revokedRecords.length > 0 && (
        <Alert className="border-amber-500/30 bg-amber-900/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-amber-200">
            <strong>Notice:</strong> {revokedRecords.length} record(s) have had access revoked by patients.
            Check the "Revoked Access" section below for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Active Shared Records */}
      <Card>
        <CardHeader>
          <CardTitle>Active Access</CardTitle>
          <CardDescription>
            Records you currently have access to
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No patients have shared records with you
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
                      <span className="text-sm text-muted-foreground">Patient:</span>
                      <code className="text-xs">{record.patient_id}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={record.permission_type === 'write' ? 'destructive' : 'secondary'}>
                        {record.permission_type} access
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Granted: {new Date(record.created_at).toLocaleDateString()}
                      </span>
                      {record.expires_at && (
                        <span className="text-xs text-muted-foreground">
                          Expires: {new Date(record.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
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
            <CardTitle>Revoked Access</CardTitle>
            <CardDescription>
              Records where patient access has been revoked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revokedRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50/5 border-red-500/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Record ID:</span>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {record.medical_record_id}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Patient:</span>
                      <code className="text-xs">{record.patient_id}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">Access Revoked</Badge>
                      <span className="text-xs text-muted-foreground">
                        Revoked: {record.revoked_at ? new Date(record.revoked_at).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                    {record.revoked_reason && (
                      <Alert className="mt-2 border-amber-500/30 bg-amber-900/20">
                        <AlertDescription className="text-amber-200 text-sm">
                          <strong>Reason:</strong> {record.revoked_reason}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <Badge variant="destructive">
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