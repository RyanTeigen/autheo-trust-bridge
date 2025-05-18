
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MessageSquare, 
  FileText, 
  Camera, 
  Pill, 
  Stethoscope, 
  ArrowUpDown,
  Clipboard 
} from 'lucide-react';

interface EnhancedQuickActionsProps {
  className?: string;
}

const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ className }) => {
  const navigate = useNavigate();
  
  const actions = [
    { 
      icon: Calendar, 
      label: 'Schedule Appointment', 
      action: () => navigate('/scheduling'),
      isPrimary: true
    },
    { 
      icon: MessageSquare, 
      label: 'Message Provider', 
      action: () => navigate('/messaging'),
      isPrimary: true
    },
    { 
      icon: FileText, 
      label: 'View Records', 
      action: () => navigate('/wallet'),
      isPrimary: true
    },
    { 
      icon: Camera, 
      label: 'Telemedicine', 
      action: () => navigate('/telemedicine'),
      isPrimary: true 
    },
    { 
      icon: Pill, 
      label: 'Refill Medication', 
      action: () => navigate('/medications'),
      isPrimary: false
    },
    { 
      icon: Stethoscope, 
      label: 'Provider List', 
      action: () => navigate('/providers'),
      isPrimary: false
    },
    { 
      icon: ArrowUpDown, 
      label: 'Transfer Records', 
      action: () => navigate('/shared-records'),
      isPrimary: false
    },
    {
      icon: Clipboard,
      label: 'Health Tracker',
      action: () => navigate('/health-tracker'),
      isPrimary: false
    }
  ];
  
  return (
    <Card className={`bg-slate-800 border-slate-700 text-slate-100 ${className || ''}`}>
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {actions.map((action, index) => (
            <Button
              key={action.label}
              variant={action.isPrimary ? "default" : "outline"}
              className={`h-auto py-3 px-4 flex flex-col items-center justify-center gap-2 ${
                action.isPrimary 
                  ? 'bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark' 
                  : 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-700 text-slate-100'
              }`}
              onClick={action.action}
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs font-medium text-center">{action.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedQuickActions;
