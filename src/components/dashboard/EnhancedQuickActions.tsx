
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  FileText, 
  Share2, 
  Shield, 
  Activity, 
  Bell,
  ArrowRight,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnhancedQuickActionsProps {
  className?: string;
}

const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({ className = "" }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Schedule Appointment',
      description: 'Book with your healthcare provider',
      icon: <Calendar className="h-5 w-5" />,
      action: () => navigate('/patient-dashboard', { state: { activeTab: 'scheduling' } }),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      title: 'View Medical Records',
      description: 'Access your medical history',
      icon: <FileText className="h-5 w-5" />,
      action: () => navigate('/patient-dashboard', { state: { activeTab: 'records' } }),
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/20'
    },
    {
      title: 'Manage Notifications',
      description: 'Review access requests and alerts',
      icon: <Bell className="h-5 w-5" />,
      action: () => navigate('/patient-dashboard', { state: { activeTab: 'notifications' } }),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20',
      badge: { text: 'New', variant: 'destructive' as const }
    },
    {
      title: 'Health Tracker',
      description: 'Monitor vital signs and metrics',
      icon: <Activity className="h-5 w-5" />,
      action: () => navigate('/patient-dashboard', { state: { activeTab: 'health-tracker' } }),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      title: 'Privacy & Security',
      description: 'Manage data sharing settings',
      icon: <Shield className="h-5 w-5" />,
      action: () => navigate('/patient-dashboard', { state: { activeTab: 'privacy-security' } }),
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/20'
    },
    {
      title: 'Share Records',
      description: 'Grant provider access permissions',
      icon: <Share2 className="h-5 w-5" />,
      action: () => navigate('/sharing'),
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20'
    }
  ];

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              variant="ghost"
              className={`h-auto p-4 justify-start text-left hover:bg-muted border ${action.borderColor} ${action.bgColor} transition-all group min-h-[100px]`}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`${action.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                  {action.icon}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-foreground group-hover:text-primary text-sm leading-tight">
                      {action.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {action.badge && (
                        <Badge variant={action.badge.variant} className="text-xs">
                          {action.badge.text}
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground group-hover:text-foreground leading-tight line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedQuickActions;
