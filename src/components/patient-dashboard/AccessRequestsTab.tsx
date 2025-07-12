import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, User, FileText, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AccessRequest {
  id: string;
  medical_record_id: string;
  grantee_id: string;
  permission_type: string;
  created_at: string;
  status: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  medical_records?: {
    record_type: string;
  } | null;
}

const AccessRequestsTab: React.FC = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, [user]);

  const fetchPendingRequests = async () => {
    if (!user) return;
    
    try {
      // Get patient ID first
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (patientError || !patientData) {
        throw new Error('Failed to fetch patient data')
      }

      const { data, error } = await supabase
        .from('sharing_permissions')
        .select('*')
        .eq('status', 'pending')
        .eq('patient_id', patientData.id)

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

      setRequests(requestsWithProfiles || [])
    } catch (error) {
      console.error('Error fetching access requests:', error);
      toast({
        title: "Error",
        description: "Failed to load access requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (requestId: string, medicalRecordId: string, granteeId: string, decision: 'approved' | 'rejected') => {
    setProcessingId(requestId);
    
    try {
      const { data, error } = await supabase.functions.invoke('respond_to_share_request', {
        body: {
          request_id: requestId,
          decision,
          decision_note: notes[requestId] || null
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: `Request ${decision}`,
          description: `Access request has been ${decision} successfully.`,
        });
        
        // Remove the processed request from the list
        setRequests(prev => prev.filter(req => req.id !== requestId));
        setNotes(prev => {
          const newNotes = { ...prev };
          delete newNotes[requestId];
          return newNotes;
        });
      } else {
        throw new Error(data?.error || `Failed to ${decision} request`);
      }
    } catch (error) {
      console.error(`Error ${decision} request:`, error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${decision} request`,
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const updateNote = (requestId: string, note: string) => {
    setNotes(prev => ({ ...prev, [requestId]: note }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/4 mb-4"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-slate-800 border border-slate-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-autheo-primary">Access Requests</h2>
          <p className="text-slate-300 mt-1">Review and respond to requests for your medical records</p>
        </div>
        <Badge variant="outline" className="bg-slate-700/50 text-slate-300">
          {requests.length} pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-200 mb-2">No pending requests</h3>
            <p className="text-slate-400">You don't have any pending access requests at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="bg-slate-800 border-slate-700 text-slate-100">
              <CardHeader className="border-b border-slate-700 bg-slate-700/30">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-autheo-primary">
                      Access Request
                    </CardTitle>
                    <CardDescription className="text-slate-300 mt-1">
                      {request.profiles ? 
                        `${request.profiles.first_name} ${request.profiles.last_name}` : 
                        'Unknown Provider'
                      } requests access to your {request.medical_records?.record_type || 'medical'} records
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-amber-100/10 text-amber-300 border-amber-300/20">
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-autheo-primary" />
                      <span className="text-slate-300">Provider:</span>
                      <span className="text-slate-100">
                        {request.profiles?.email || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-autheo-primary" />
                      <span className="text-slate-300">Requested:</span>
                      <span className="text-slate-100">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`note-${request.id}`} className="text-slate-300">
                      Add a note (optional)
                    </Label>
                    <Textarea
                      id={`note-${request.id}`}
                      value={notes[request.id] || ''}
                      onChange={(e) => updateNote(request.id, e.target.value)}
                      placeholder="Add any notes about this decision..."
                      className="bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => handleDecision(request.id, request.medical_record_id, request.grantee_id, 'approved')}
                      disabled={processingId === request.id}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {processingId === request.id ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleDecision(request.id, request.medical_record_id, request.grantee_id, 'rejected')}
                      disabled={processingId === request.id}
                      variant="outline"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {processingId === request.id ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessRequestsTab;