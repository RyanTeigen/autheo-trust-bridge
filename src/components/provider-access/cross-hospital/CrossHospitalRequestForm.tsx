import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface Hospital {
  hospital_id: string;
  hospital_name: string;
  address: string;
  contact_email: string;
  verification_status: string;
}

interface CrossHospitalRequestFormProps {
  onRequestCreated?: () => void;
}

const CrossHospitalRequestForm: React.FC<CrossHospitalRequestFormProps> = ({ onRequestCreated }) => {
  const [formData, setFormData] = useState({
    patientEmail: '',
    receivingHospitalId: '',
    urgencyLevel: 'normal',
    clinicalJustification: '',
    permissionType: 'read',
    expiresAt: ''
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchVerifiedHospitals();
  }, []);

  const fetchVerifiedHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospital_registry')
        .select('*')
        .eq('verification_status', 'verified')
        .order('hospital_name');

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast({
        title: "Error",
        description: "Failed to load hospital registry",
        variant: "destructive",
      });
    } finally {
      setLoadingHospitals(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientEmail || !formData.receivingHospitalId || !formData.clinicalJustification) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // First, get patient ID from email
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id, user_id')
        .eq('email', formData.patientEmail)
        .single();

      if (patientError || !patientData) {
        toast({
          title: "Patient Not Found",
          description: "No patient found with the provided email",
          variant: "destructive",
        });
        return;
      }

      // Get current provider ID (assuming it's the authenticated user)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to submit requests",
          variant: "destructive",
        });
        return;
      }

      // Get provider data
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('id', user.id)
        .single();

      if (providerError || !providerData) {
        toast({
          title: "Provider Not Found",
          description: "Provider profile not found",
          variant: "destructive",
        });
        return;
      }

      // Get requesting hospital (we'll need to determine this - for now using a default)
      const requestingHospitalId = 'ST-MARY-001'; // This should be determined from the provider's hospital

      // Create cross-hospital request
      const { data, error } = await supabase
        .from('cross_hospital_requests')
        .insert({
          patient_id: patientData.id,
          requesting_hospital_id: requestingHospitalId,
          receiving_hospital_id: formData.receivingHospitalId,
          provider_id: providerData.id,
          urgency_level: formData.urgencyLevel,
          clinical_justification: formData.clinicalJustification,
          permission_type: formData.permissionType,
          expires_at: formData.expiresAt || null,
          audit_trail: [{
            action: 'request_created',
            timestamp: new Date().toISOString(),
            actor: user.id,
            details: 'Cross-hospital access request initiated'
          }]
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Cross-Hospital Request Submitted",
        description: "Request has been sent to the patient and receiving hospital for approval",
      });
      
      // Reset form
      setFormData({
        patientEmail: '',
        receivingHospitalId: '',
        urgencyLevel: 'normal',
        clinicalJustification: '',
        permissionType: 'read',
        expiresAt: ''
      });
      
      onRequestCreated?.();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Request Failed",
        description: "Failed to submit cross-hospital request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const selectedHospital = hospitals.find(h => h.hospital_id === formData.receivingHospitalId);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-autheo-primary" />
          Cross-Hospital Access Request
        </CardTitle>
        <CardDescription className="text-slate-400">
          Request patient medical records from another verified healthcare institution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Email */}
          <div className="space-y-2">
            <Label htmlFor="patientEmail" className="text-slate-200">
              Patient Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="patientEmail"
              type="email"
              value={formData.patientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
              placeholder="patient@example.com"
              className="bg-slate-700 border-slate-600 text-slate-200"
              required
            />
          </div>

          {/* Receiving Hospital */}
          <div className="space-y-2">
            <Label htmlFor="receivingHospital" className="text-slate-200">
              Receiving Hospital <span className="text-red-400">*</span>
            </Label>
            <Select 
              value={formData.receivingHospitalId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, receivingHospitalId: value }))}
              disabled={loadingHospitals}
            >
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                <SelectValue placeholder={loadingHospitals ? "Loading hospitals..." : "Select receiving hospital"} />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {hospitals.map((hospital) => (
                  <SelectItem key={hospital.hospital_id} value={hospital.hospital_id}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="font-medium">{hospital.hospital_name}</div>
                        <div className="text-xs text-slate-400">{hospital.hospital_id}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedHospital && (
              <div className="p-3 bg-slate-700/50 rounded-md border border-slate-600">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <p className="text-sm text-slate-300">{selectedHospital.address}</p>
                <p className="text-sm text-slate-400">{selectedHospital.contact_email}</p>
              </div>
            )}
          </div>

          {/* Urgency Level and Permission Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="urgencyLevel" className="text-slate-200">
                Urgency Level
              </Label>
              <Select value={formData.urgencyLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, urgencyLevel: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getUrgencyColor('low')}`} />
                      Low Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="normal">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getUrgencyColor('normal')}`} />
                      Normal Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getUrgencyColor('high')}`} />
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getUrgencyColor('critical')}`} />
                      Critical
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permissionType" className="text-slate-200">
                Permission Type
              </Label>
              <Select value={formData.permissionType} onValueChange={(value) => setFormData(prev => ({ ...prev, permissionType: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="read">Read Only</SelectItem>
                  <SelectItem value="write">Read & Write</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Access Expiry */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt" className="text-slate-200">
              Access Expiry (Optional)
            </Label>
            <Input
              id="expiresAt"
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-slate-200"
            />
          </div>

          {/* Clinical Justification */}
          <div className="space-y-2">
            <Label htmlFor="clinicalJustification" className="text-slate-200">
              Clinical Justification <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="clinicalJustification"
              value={formData.clinicalJustification}
              onChange={(e) => setFormData(prev => ({ ...prev, clinicalJustification: e.target.value }))}
              placeholder="Provide detailed clinical justification for cross-hospital access..."
              className="bg-slate-700 border-slate-600 text-slate-200 min-h-[120px]"
              required
            />
            <p className="text-xs text-slate-400">
              Explain the medical necessity and how this will benefit patient care
            </p>
          </div>

          {/* Security Notice */}
          <Alert className="border-amber-500/30 bg-amber-900/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-slate-200 text-sm">
              <strong>Cross-Hospital Protocol:</strong> This request requires both patient consent 
              and approval from the receiving hospital. All data transfers are encrypted and audited.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <Alert className="flex-1 mr-4 border-blue-500/30 bg-blue-900/20">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-slate-200 text-sm">
                Request will initiate a secure cross-hospital verification process
              </AlertDescription>
            </Alert>
            
            <Button
              type="submit"
              disabled={isSubmitting || !formData.patientEmail || !formData.receivingHospitalId || !formData.clinicalJustification}
              className="bg-autheo-primary hover:bg-autheo-primary/80 text-white min-w-[140px]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  Submitting...
                </div>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CrossHospitalRequestForm;