import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface ShareRequest {
  id: string
  grantee_id: string
  permission_type: string
  created_at: string
  medical_record_id: string
  patient_id: string
  status: string
  expires_at: string | null
  responded_at: string | null
  decision_note: string | null
  signed_consent: string | null
  updated_at: string | null
  profiles?: {
    first_name: string
    last_name: string
    email: string
  } | null
  medical_records?: {
    record_type: string
  } | null
}

export default function PatientShareRequests() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [requests, setRequests] = useState<ShareRequest[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRequests = async () => {
    if (!user) return

    try {
      // Get patient ID first
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (patientError || !patientData) {
        console.error('Error fetching patient data:', patientError)
        return
      }

      const { data, error } = await supabase
        .from('sharing_permissions')
        .select('*')
        .eq('patient_id', patientData.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch profile information for each grantee
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', request.grantee_id)
            .single()

          const { data: medicalRecord } = await supabase
            .from('medical_records')
            .select('record_type')
            .eq('id', request.medical_record_id)
            .single()

          return {
            ...request,
            profiles: profile,
            medical_records: medicalRecord
          }
        })
      )

      setRequests(requestsWithProfiles)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to load share requests",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDecision = async (requestId: string, decision: 'approved' | 'rejected') => {
    try {
      const { data, error } = await supabase.functions.invoke('respond_to_share_request', {
        body: {
          request_id: requestId,
          decision,
        }
      })

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: `Request ${decision === 'approved' ? 'approved' : 'denied'} successfully`,
      })

      // Remove the request from the list
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch (error) {
      console.error('Error responding to request:', error)
      toast({
        title: "Error",
        description: "Failed to respond to request",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    if (user) {
      fetchRequests()
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
          <Clock className="h-5 w-5 text-autheo-primary" />
          Pending Access Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {request.profiles?.first_name} {request.profiles?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {request.profiles?.email}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Record Type:</span> {request.medical_records?.record_type || 'Unknown'}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Access Level:</span> {request.permission_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Requested: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleDecision(request.id, 'approved')} 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDecision(request.id, 'rejected')} 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}