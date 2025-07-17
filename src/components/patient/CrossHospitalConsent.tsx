import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Building2, Shield, Clock, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface CrossHospitalRequest {
  id: string;
  requesting_hospital_id: string;
  receiving_hospital_id: string;
  urgency_level: string;
  clinical_justification: string;
  permission_type: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  patient_consent_given: boolean;
  requesting_hospital?: {
    hospital_name: string;
    address: string;
    contact_email: string;
  };
  receiving_hospital?: {
    hospital_name: string;
    address: string;
    contact_email: string;
  };
  provider?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

const CrossHospitalConsent: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<CrossHospitalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [consentNotes, setConsentNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      fetchCrossHospitalRequests();
    }
  }, [user]);

  const fetchCrossHospitalRequests = async () => {
    if (!user) return;

    try {
      // Get patient ID first
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError || !patientData) {
        console.error('Error fetching patient data:', patientError);
        setLoading(false);
        return;
      }

      // Fetch cross-hospital requests for this patient
      const { data, error } = await supabase
        .from('cross_hospital_requests')
        .select('*')
        .eq('patient_id', patientData.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch additional details for each request
      const requestsWithDetails = await Promise.all(
        (data || []).map(async (request) => {
          // Get hospital details
          const [requestingHospital, receivingHospital, provider] = await Promise.all([
            supabase
              .from('hospital_registry')
              .select('hospital_name, address, contact_email')
              .eq('hospital_id', request.requesting_hospital_id)
              .single(),
            supabase
              .from('hospital_registry')
              .select('hospital_name, address, contact_email')
              .eq('hospital_id', request.receiving_hospital_id)
              .single(),
            supabase
              .from('profiles')
              .select('first_name, last_name, email')
              .eq('id', request.provider_id)
              .single()
          ]);

          return {
            ...request,
            requesting_hospital: requestingHospital.data,
            receiving_hospital: receivingHospital.data,
            provider: provider.data
          };
        })
      );

      setRequests(requestsWithDetails);
    } catch (error) {
      console.error('Error fetching cross-hospital requests:', error);
      toast({
        title: "Error",
        description: "Failed to load cross-hospital requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConsentDecision = async (requestId: string, decision: 'approve' | 'deny') => {
    if (!user) return;

    setProcessingRequest(requestId);

    try {
      const updateData: any = {
        patient_consent_given: decision === 'approve',
        patient_consent_at: new Date().toISOString(),
        status: decision === 'approve' ? 'patient_approved' : 'patient_denied',
        updated_at: new Date().toISOString()
      };

      // Add consent notes if provided
      const notes = consentNotes[requestId];
      if (notes) {
        const request = requests.find(r => r.id === requestId);
        const auditEntry = {
          action: `patient_consent_${decision}`,
          timestamp: new Date().toISOString(),
          actor: user.id,
          details: `Patient ${decision === 'approve' ? 'approved' : 'denied'} cross-hospital access`,
          notes: notes
        };
        
        updateData.audit_trail = request ? [...(request as any).audit_trail, auditEntry] : [auditEntry];
      }

      const { error } = await supabase
        .from('cross_hospital_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Consent Recorded",
        description: `You have ${decision === 'approve' ? 'approved' : 'denied'} the cross-hospital access request`,
      });

      // Remove the request from the list
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      // Clear consent notes for this request
      setConsentNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[requestId];
        return newNotes;
      });

    } catch (error) {
      console.error('Error updating consent:', error);
      toast({
        title: "Error",
        description: "Failed to record consent decision",
        variant: "destructive"
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const getUrgencyBadge = (level: string) => {
    const configs = {
      critical: { color: 'bg-red-600', label: 'Critical' },
      high: { color: 'bg-orange-500', label: 'High' },
      normal: { color: 'bg-blue-500', label: 'Normal' },
      low: { color: 'bg-gray-500', label: 'Low' }
    };
    const config = configs[level as keyof typeof configs] || configs.normal;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-autheo-primary" />
          Cross-Hospital Access Requests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending cross-hospital requests.</p>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request.id} className="border-2 border-amber-200 bg-amber-50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-autheo-primary" />
                          Cross-Hospital Access Request
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Submitted {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getUrgencyBadge(request.urgency_level)}
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {request.permission_type}
                        </Badge>
                      </div>
                    </div>

                    {/* Hospital Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg border">
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">REQUESTING HOSPITAL</h4>
                        <p className="font-semibold">{request.requesting_hospital?.hospital_name}</p>
                        <p className="text-sm text-muted-foreground">{request.requesting_hospital?.address}</p>
                        <p className="text-sm text-muted-foreground">{request.requesting_hospital?.contact_email}</p>
                      </div>
                      
                      <div className="p-4 bg-white rounded-lg border">
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">RECEIVING HOSPITAL</h4>
                        <p className="font-semibold">{request.receiving_hospital?.hospital_name}</p>
                        <p className="text-sm text-muted-foreground">{request.receiving_hospital?.address}</p>
                        <p className="text-sm text-muted-foreground">{request.receiving_hospital?.contact_email}</p>
                      </div>
                    </div>

                    {/* Provider Information */}
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">REQUESTING PROVIDER</h4>
                      <p className="font-semibold">
                        {request.provider?.first_name} {request.provider?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{request.provider?.email}</p>
                    </div>

                    {/* Clinical Justification */}
                    <div className="p-4 bg-white rounded-lg border">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">CLINICAL JUSTIFICATION</h4>
                      <p className="text-sm">{request.clinical_justification}</p>
                    </div>

                    {/* Expiry Information */}
                    {request.expires_at && (
                      <Alert className="border-orange-200 bg-orange-50">
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                          Access will expire on {new Date(request.expires_at).toLocaleDateString()} at {new Date(request.expires_at).toLocaleTimeString()}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Security Notice */}
                    <Alert className="border-blue-200 bg-blue-50">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Security Notice:</strong> This request allows secure sharing of your medical records 
                        between verified healthcare institutions. All access is logged and audited.
                      </AlertDescription>
                    </Alert>

                    <Separator />

                    {/* Consent Notes */}
                    <div className="space-y-2">
                      <Label htmlFor={`notes-${request.id}`} className="text-sm font-medium">
                        Additional Notes (Optional)
                      </Label>
                      <Textarea
                        id={`notes-${request.id}`}
                        value={consentNotes[request.id] || ''}
                        onChange={(e) => setConsentNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                        placeholder="Add any specific conditions or notes about your consent decision..."
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                      <Button 
                        onClick={() => handleConsentDecision(request.id, 'approve')} 
                        disabled={processingRequest === request.id}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {processingRequest === request.id ? 'Processing...' : 'Approve Access'}
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        onClick={() => handleConsentDecision(request.id, 'deny')} 
                        disabled={processingRequest === request.id}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        {processingRequest === request.id ? 'Processing...' : 'Deny Access'}
                      </Button>
                      
                      <Alert className="flex-1 ml-4 border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Your decision will be final and cannot be changed once submitted.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrossHospitalConsent;