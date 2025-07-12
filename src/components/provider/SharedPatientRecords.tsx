import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { FileText, User, Calendar, Shield } from 'lucide-react'

interface SharedRecord {
  id: string
  patient_id: string
  record_type: string
  encrypted_data: string
  created_at: string
  permission_type: string
  patient_name: string
}

export default function SharedPatientRecords() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [records, setRecords] = useState<SharedRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSharedRecords = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('get_provider_visible_records', {
        current_user_id: user.id,
      })

      if (error) {
        throw error
      }

      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching shared records:', error)
      toast({
        title: "Error",
        description: "Failed to fetch shared patient records",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchSharedRecords()
    }
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-autheo-primary" />
          Shared Patient Records
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No shared records available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Patients haven't shared any records with you yet
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-autheo-primary" />
                      <span className="font-medium">{record.patient_name || 'Unknown Patient'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{record.record_type}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="bg-green-100/10 text-green-400 border-green-400/20">
                    {record.permission_type}
                  </Badge>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Record ID:</span> {record.id.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Encrypted data available for authorized access
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}