
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
      description: 'Book a new appointment with your healthcare provider',
      icon: <Calendar className="h-5 w-5" />,
      action: () => navigate('/patient-dashboard', { state: { activeTab: 'scheduling' } }),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      title: 'View Medical Records',
      description: 'Access your complete medical history and documents',
      icon: <FileText className="h-5 w-5" />,
      action: () => navigate('/patient-dashboard', { state: { activeTab: 'records' } }),
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20'
    },
    {
      title: 'Manage Notifications',
      description: 'Review access requests and important alerts',
      icon: <Bell className="h-5 w-5" />,
      action: () => navigate('/patient-dashboard', { state: { activeTab: 'notifications' } }),
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      badge: { text: 'New', variant: 'destructive' as const }
    },
    {
      title: 'Health Tracker',
      description: 'Monitor your vital signs and health metrics',
      icon: <Activity className="h-5 w-5" />,
      action: () => navigate('/patient-dashboard', { state: { activeTab: 'health-tracker' } }),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      title: 'Privacy & Security',
      description: 'Manage your data sharing preferences and security settings',
      icon: <Shield className="h-5 w-5" />,
      action: () => navigate('/patient-dashboard', { state: { activeTab: 'privacy-security' } }),
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    },
    {
      title: 'Share Records',
      description: 'Grant access to your medical records to healthcare providers',
      icon: <Share2 className="h-5 w-5" />,
      action: () => navigate('/sharing'),
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    }
  ];

  return (
    <Card className={`bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader>
        <CardTitle className="text-slate-100 flex items-center gap-2">
          <Clock className="h-5 w-5 text-autheo-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              variant="ghost"
              className={`h-auto p-4 justify-start text-left hover:bg-slate-700 border ${action.borderColor} ${action.bgColor} transition-all group`}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`${action.color} group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-200 group-hover:text-white">
                      {action.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {action.badge && (
                        <Badge variant={action.badge.variant} className="text-xs">
                          {action.badge.text}
                        </Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-autheo-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300">
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
