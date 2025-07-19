
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Calendar, User, Clock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AppointmentAccessHandlerProps {
  notification: {
    id: string;
    data: any;
  };
  onDecision: () => void;
}

export const AppointmentAccessHandler: React.FC<AppointmentAccessHandlerProps> = ({
  notification,
  onDecision
}) => {
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleAccessDecision = async (decision: 'approve' | 'deny') => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('respond-to-appointment-access-request', {
        body: {
          appointmentId: notification.data.appointment_id,
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

      onDecision();
    } catch (error) {
      console.error('Error processing access decision:', error);
      toast({
        title: "Error",
        description: `Failed to ${decision} access request`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getUrgencyBadge = () => {
    if (notification.data.urgency_level === 'urgent' || notification.data.urgency_level === 'emergency') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Urgent
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-200">Appointment Access Request</h4>
        {getUrgencyBadge()}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-400">Provider:</span>
          <p className="text-slate-200 font-medium">{notification.data.provider_name}</p>
        </div>
        <div>
          <span className="text-slate-400">Type:</span>
          <p className="text-slate-200">{notification.data.appointment_type}</p>
        </div>
        <div>
          <span className="text-slate-400">Date:</span>
          <p className="text-slate-200">
            {format(new Date(notification.data.appointment_date), "MMM dd, yyyy 'at' h:mm a")}
          </p>
        </div>
        <div>
          <span className="text-slate-400">Duration:</span>
          <p className="text-slate-200">{notification.data.access_duration_hours} hours</p>
        </div>
      </div>

      {notification.data.required_data_types && notification.data.required_data_types.length > 0 && (
        <div>
          <span className="text-slate-400 text-sm">Required Data:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {notification.data.required_data_types.map((dataType: string) => (
              <Badge key={dataType} variant="outline" className="text-xs">
                {dataType.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {notification.data.access_justification && (
        <div>
          <span className="text-slate-400 text-sm">Justification:</span>
          <p className="text-slate-300 text-sm mt-1">{notification.data.access_justification}</p>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">
          Add a note (optional)
        </label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add any comments about your decision..."
          className="bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-400"
          rows={2}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => handleAccessDecision('approve')}
          disabled={isProcessing}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
          ) : (
            <CheckCircle className="h-3 w-3 mr-2" />
          )}
          Approve
        </Button>
        
        <Button
          variant="destructive"
          onClick={() => handleAccessDecision('deny')}
          disabled={isProcessing}
          className="flex-1"
          size="sm"
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
          ) : (
            <XCircle className="h-3 w-3 mr-2" />
          )}
          Deny
        </Button>
      </div>

      <div className="text-xs text-slate-400 text-center">
        Your decision will be logged for security and compliance purposes
      </div>
    </div>
  );
};
