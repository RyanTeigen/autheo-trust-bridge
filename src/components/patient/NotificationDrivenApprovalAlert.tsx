import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock, Volume2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import SimplifiedApprovalModal from './SimplifiedApprovalModal';

interface PendingRequest {
  id: string;
  grantee_id: string;
  permission_type: string;
  created_at: string;
  medical_record_id: string;
  patient_id: string;
  status: string;
  expires_at: string | null;
  urgency_level?: string;
  clinical_justification?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  medical_records?: {
    record_type: string;
  } | null;
}

const NotificationDrivenApprovalAlert: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRequests();
    
    // Set up real-time listener for new requests
    if (user) {
      const channel = supabase
        .channel('approval_alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'sharing_permissions',
            filter: `status=eq.pending`
          },
          (payload) => {
            playNotificationSound();
            fetchPendingRequests();
            showUrgentNotification();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchPendingRequests = async () => {
    if (!user) return;

    try {
      // Get patient ID first
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError || !patientData) return;

      const { data, error } = await supabase
        .from('sharing_permissions')
        .select('*')
        .eq('patient_id', patientData.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile and medical record information
      const requestsWithDetails = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', request.grantee_id)
            .single();

          const { data: medicalRecord } = await supabase
            .from('medical_records')
            .select('record_type')
            .eq('id', request.medical_record_id)
            .single();

          return {
            ...request,
            profiles: profile,
            medical_records: medicalRecord
          };
        })
      );

      setPendingRequests(requestsWithDetails);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const playNotificationSound = () => {
    if (audioEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        "You have a new access request that requires your attention."
      );
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const showUrgentNotification = () => {
    toast({
      title: "🚨 New Access Request",
      description: "A healthcare provider is requesting access to your medical records",
      duration: 10000,
    });
  };

  const handleQuickApprove = async (request: PendingRequest) => {
    try {
      const { error } = await supabase.functions.invoke('respond_to_access_request', {
        body: {
          medical_record_id: request.medical_record_id,
          grantee_id: request.grantee_id,
          decision: 'approved',
          note: 'Quick approval via notification alert'
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Request Approved",
        description: `Access granted to ${request.profiles?.first_name} ${request.profiles?.last_name}`,
      });

      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      });
    }
  };

  const handleQuickDeny = async (request: PendingRequest) => {
    try {
      const { error } = await supabase.functions.invoke('respond_to_access_request', {
        body: {
          medical_record_id: request.medical_record_id,
          grantee_id: request.grantee_id,
          decision: 'rejected',
          note: 'Quick denial via notification alert'
        }
      });

      if (error) throw error;

      toast({
        title: "❌ Request Denied",
        description: `Access denied for ${request.profiles?.first_name} ${request.profiles?.last_name}`,
      });

      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Error denying request:', error);
      toast({
        title: "Error",
        description: "Failed to deny request",
        variant: "destructive"
      });
    }
  };

  const openDetailedModal = (request: PendingRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'urgent': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 mb-6">
        {pendingRequests.map((request) => (
          <Alert 
            key={request.id} 
            className={`${getUrgencyColor(request.urgency_level)} border-2 animate-pulse shadow-lg`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="relative">
                  <Shield className="h-6 w-6 text-blue-500" />
                  {request.urgency_level === 'urgent' && (
                    <AlertTriangle className="h-4 w-4 text-red-500 absolute -top-1 -right-1" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-100 text-lg">
                      🏥 Access Request from {request.profiles?.first_name} {request.profiles?.last_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {request.permission_type} access
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {request.medical_records?.record_type || 'Medical Record'}
                      </Badge>
                      {request.urgency_level && (
                        <Badge 
                          variant={request.urgency_level === 'urgent' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {request.urgency_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={audioEnabled ? 'text-blue-400' : 'text-slate-400'}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>

                <AlertDescription className="text-slate-200 text-base">
                  <strong>{request.profiles?.email}</strong> is requesting {request.permission_type} access 
                  to your {request.medical_records?.record_type?.toLowerCase() || 'medical record'}.
                  {request.clinical_justification && (
                    <div className="mt-2 p-2 bg-slate-700 rounded text-sm">
                      <strong>Clinical justification:</strong> {request.clinical_justification}
                    </div>
                  )}
                </AlertDescription>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                    {request.expires_at && (
                      <span className="ml-2">
                        • Expires {new Date(request.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={() => handleQuickApprove(request)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Quick Approve
                  </Button>
                  
                  <Button 
                    variant="destructive"
                    onClick={() => handleQuickDeny(request)}
                    className="flex items-center gap-2 font-medium px-6"
                  >
                    <XCircle className="h-4 w-4" />
                    Quick Deny
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => openDetailedModal(request)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 font-medium"
                  >
                    Review Details
                  </Button>
                </div>
              </div>
            </div>
          </Alert>
        ))}
      </div>

      <SimplifiedApprovalModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        request={selectedRequest}
        onApprove={(request, note) => {
          handleQuickApprove(request);
          setIsModalOpen(false);
        }}
        onDeny={(request, note) => {
          handleQuickDeny(request);
          setIsModalOpen(false);
        }}
      />
    </>
  );
};

export default NotificationDrivenApprovalAlert;