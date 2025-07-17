import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEnhancedAccessRequestAPI } from '@/hooks/useEnhancedAccessRequestAPI';
import { useToast } from '@/hooks/use-toast';
import { FileText, AlertCircle, Building2, Clock, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedAccessRequestFormProps {
  onRequestCreated?: () => void;
}

const EnhancedAccessRequestForm: React.FC<EnhancedAccessRequestFormProps> = ({ onRequestCreated }) => {
  const [formData, setFormData] = useState({
    patientEmail: '',
    requestType: '',
    urgencyLevel: 'normal',
    hospitalId: '',
    department: '',
    clinicalJustification: '',
    permissionType: 'read',
    expiresAt: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createEnhancedAccessRequest } = useEnhancedAccessRequestAPI();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientEmail || !formData.requestType || !formData.clinicalJustification) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createEnhancedAccessRequest({
        ...formData,
        requestType: formData.requestType as any,
        urgencyLevel: formData.urgencyLevel as any,
        permissionType: formData.permissionType as any,
        expiresAt: formData.expiresAt || undefined
      });

      if (result.success) {
        toast({
          title: "Access Request Submitted",
          description: `Your ${formData.requestType} access request has been sent to the patient`,
        });
        
        // Reset form
        setFormData({
          patientEmail: '',
          requestType: '',
          urgencyLevel: 'normal',
          hospitalId: '',
          department: '',
          clinicalJustification: '',
          permissionType: 'read',
          expiresAt: ''
        });
        
        onRequestCreated?.();
      } else {
        toast({
          title: "Request Failed",
          description: result.error || "Failed to submit access request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Network Error",
        description: "Unable to submit request. Please try again.",
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

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'cross_hospital': return <Building2 className="h-4 w-4 text-blue-500" />;
      case 'research': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'consultation': return <Shield className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-autheo-primary" />
          Enhanced Access Request
        </CardTitle>
        <CardDescription className="text-slate-400">
          Submit a comprehensive request for patient medical record access with detailed justification
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Request Type and Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requestType" className="text-slate-200">
                Request Type <span className="text-red-400">*</span>
              </Label>
              <Select value={formData.requestType} onValueChange={(value) => setFormData(prev => ({ ...prev, requestType: value }))}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200">
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="standard">
                    <div className="flex items-center gap-2">
                      {getRequestTypeIcon('standard')}
                      Standard Access
                    </div>
                  </SelectItem>
                  <SelectItem value="emergency">
                    <div className="flex items-center gap-2">
                      {getRequestTypeIcon('emergency')}
                      Emergency Access
                    </div>
                  </SelectItem>
                  <SelectItem value="cross_hospital">
                    <div className="flex items-center gap-2">
                      {getRequestTypeIcon('cross_hospital')}
                      Cross-Hospital
                    </div>
                  </SelectItem>
                  <SelectItem value="research">
                    <div className="flex items-center gap-2">
                      {getRequestTypeIcon('research')}
                      Research Access
                    </div>
                  </SelectItem>
                  <SelectItem value="consultation">
                    <div className="flex items-center gap-2">
                      {getRequestTypeIcon('consultation')}
                      Consultation
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

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
          </div>

          {/* Hospital and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hospitalId" className="text-slate-200">
                Hospital/Institution ID
              </Label>
              <Input
                id="hospitalId"
                value={formData.hospitalId}
                onChange={(e) => setFormData(prev => ({ ...prev, hospitalId: e.target.value }))}
                placeholder="e.g., ST-MARY-001"
                className="bg-slate-700 border-slate-600 text-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-slate-200">
                Department
              </Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Cardiology, Emergency"
                className="bg-slate-700 border-slate-600 text-slate-200"
              />
            </div>
          </div>

          {/* Permission Type and Expiry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Provide detailed clinical justification for this access request..."
              className="bg-slate-700 border-slate-600 text-slate-200 min-h-[100px]"
              required
            />
            <p className="text-xs text-slate-400">
              Provide clear medical reasoning for why access to this patient's records is necessary
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <Alert className="flex-1 mr-4 border-blue-500/30 bg-blue-900/20">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-slate-200 text-sm">
                Request will be sent to the patient for approval. Response time varies by urgency level.
              </AlertDescription>
            </Alert>
            
            <Button
              type="submit"
              disabled={isSubmitting || !formData.patientEmail || !formData.requestType || !formData.clinicalJustification}
              className="bg-autheo-primary hover:bg-autheo-primary/80 text-white min-w-[120px]"
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

export default EnhancedAccessRequestForm;