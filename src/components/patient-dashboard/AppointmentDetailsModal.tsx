import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarDays, Clock, User, FileText, Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AppointmentDetails {
  appointment: {
    id: string;
    appointment_type: string;
    appointment_date: string;
    status: string;
    urgency_level: string;
    clinical_notes?: string;
    access_request_status: string;
    access_granted_at?: string;
    access_expires_at?: string;
  };
  provider: {
    id: string;
    name: string;
    email: string;
  };
  access_info: {
    access_granted: boolean;
    access_duration_hours: number;
    clinical_justification?: string;
    auto_granted: boolean;
  };
  data_requirements: {
    required_data_types: string[];
    access_justification?: string;
    priority_level: string;
  };
}

interface AppointmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  onAccessDecision?: () => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  open,
  onOpenChange,
  appointmentId,
  onAccessDecision
}) => {
  const [details, setDetails] = useState<AppointmentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [responding, setResponding] = useState(false);
  const [note, setNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [open, appointmentId]);

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-appointment-details', {
        body: { appointmentId }
      });

      if (error) throw error;
      setDetails(data);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccessDecision = async (decision: 'approve' | 'deny') => {
    if (!details) return;

    setResponding(true);
    try {
      const { data, error } = await supabase.functions.invoke('respond-to-appointment-access-request', {
        body: {
          appointmentId: details.appointment.id,
          decision,
          note: note.trim() || undefined
        }
      });

      if (error) throw error;

      toast({
        title: decision === 'approve' ? "Access Approved" : "Access Denied",
        description: data.message,
        variant: decision === 'approve' ? "default" : "destructive",
      });

      onOpenChange(false);
      onAccessDecision?.();
    } catch (error) {
      console.error('Error processing access decision:', error);
      toast({
        title: "Error",
        description: `Failed to ${decision} access request`,
        variant: "destructive",
      });
    } finally {
      setResponding(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'auto_approved':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'emergency': return 'destructive';
      case 'urgent': return 'destructive';
      case 'high': return 'warning';
      case 'normal': return 'secondary';
      default: return 'secondary';
    }
  };

  const canRespond = details?.appointment.access_request_status === 'pending';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Appointment Access Request
          </DialogTitle>
          <DialogDescription>
            Review the appointment details and data access requirements
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Appointment Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Appointment Details
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(details.appointment.access_request_status)}
                  <Badge variant={details.appointment.access_request_status === 'approved' || details.appointment.access_request_status === 'auto_approved' ? 'default' : details.appointment.access_request_status === 'denied' ? 'destructive' : 'secondary'}>
                    {details.appointment.access_request_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p className="text-sm text-muted-foreground">{details.appointment.appointment_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(details.appointment.appointment_date), "PPP 'at' p")}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Urgency</Label>
                  <Badge variant={getUrgencyColor(details.appointment.urgency_level) as "default" | "destructive" | "secondary" | "outline"}>
                    {details.appointment.urgency_level}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm text-muted-foreground">{details.access_info.access_duration_hours} hours</p>
                </div>
              </div>
            </div>

            {/* Provider Info */}
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Healthcare Provider
              </h3>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="font-medium">{details.provider.name}</p>
                <p className="text-sm text-muted-foreground">{details.provider.email}</p>
              </div>
            </div>

            {/* Data Requirements */}
            <div className="space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Required Medical Data
              </h3>
              <div className="bg-muted/50 p-3 rounded-lg space-y-3">
                <div className="flex flex-wrap gap-2">
                  {details.data_requirements.required_data_types.map((dataType) => (
                    <Badge key={dataType} variant="outline">
                      {dataType.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
                {details.data_requirements.access_justification && (
                  <div>
                    <Label className="text-xs font-medium">Justification</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {details.data_requirements.access_justification}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium">Priority Level:</Label>
                  <Badge variant={details.data_requirements.priority_level === 'high' || details.data_requirements.priority_level === 'urgent' ? 'destructive' : 'secondary' as "default" | "destructive" | "secondary" | "outline"}>
                    {details.data_requirements.priority_level}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Clinical Notes */}
            {details.appointment.clinical_notes && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Clinical Notes
                </h3>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">{details.appointment.clinical_notes}</p>
                </div>
              </div>
            )}

            {/* Access Status */}
            {details.access_info.auto_granted && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Auto-Approved</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  This request was automatically approved based on your consent preferences.
                </p>
              </div>
            )}

            {/* Response Section */}
            {canRespond && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label htmlFor="note">Additional Notes (Optional)</Label>
                  <Textarea
                    id="note"
                    placeholder="Add any notes about your decision..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAccessDecision('approve')}
                    disabled={responding}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Access
                  </Button>
                  <Button
                    onClick={() => handleAccessDecision('deny')}
                    disabled={responding}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny Access
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load appointment details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};