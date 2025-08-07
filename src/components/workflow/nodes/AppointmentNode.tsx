import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, MapPin } from 'lucide-react';

interface AppointmentNodeData {
  appointmentType: 'consultation' | 'follow-up' | 'emergency' | 'screening' | 'procedure';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  patientName?: string;
  providerName?: string;
  appointmentDate?: string;
  duration?: number;
  location?: string;
  urgencyLevel: 'routine' | 'urgent' | 'emergency';
  requiresPrep: boolean;
  telehealth: boolean;
}

interface AppointmentNodeProps {
  data: AppointmentNodeData;
  isConnectable: boolean;
}

export const AppointmentNode = memo(({ data, isConnectable }: AppointmentNodeProps) => {
  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'consultation': return '👩‍⚕️';
      case 'follow-up': return '🔄';
      case 'emergency': return '🚨';
      case 'screening': return '🔍';
      case 'procedure': return '⚕️';
      default: return '📅';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'confirmed': return 'bg-primary';
      case 'in-progress': return 'bg-warning';
      case 'cancelled': return 'bg-destructive';
      case 'no-show': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-destructive';
      case 'urgent': return 'bg-warning';
      default: return 'bg-primary';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3"
      />
      
      <Card className="w-80 border-accent/20 bg-accent/5">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <CardTitle className="text-sm">Appointment</CardTitle>
            <span className="text-xs">{getAppointmentIcon(data.appointmentType)}</span>
            {data.telehealth && <span className="text-xs">💻</span>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {data.appointmentType.toUpperCase()}
            </Badge>
            <Badge variant="secondary" className={getStatusColor(data.status)}>
              {data.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={getUrgencyColor(data.urgencyLevel)}>
              {data.urgencyLevel}
            </Badge>
            {data.requiresPrep && (
              <Badge variant="outline" className="text-xs">
                Prep Required
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {data.patientName && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">Patient: {data.patientName}</span>
              </div>
            )}

            {data.providerName && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">Provider: {data.providerName}</span>
              </div>
            )}

            {data.appointmentDate && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">{formatDate(data.appointmentDate)}</span>
              </div>
            )}

            {data.duration && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">Duration: {data.duration} min</span>
              </div>
            )}

            {data.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs">{data.location}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Handle
        type="source"
        position={Position.Bottom}
        id="completed"
        isConnectable={isConnectable}
        className="w-3 h-3"
        style={{ left: '20%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="cancelled"
        isConnectable={isConnectable}
        className="w-3 h-3"
        style={{ left: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="no-show"
        isConnectable={isConnectable}
        className="w-3 h-3"
        style={{ left: '80%' }}
      />
    </>
  );
});

AppointmentNode.displayName = 'AppointmentNode';