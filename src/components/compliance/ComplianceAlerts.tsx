
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Check, AlertTriangle, XCircle, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface AlertPreference {
  id: string;
  type: string;
  enabled: boolean;
  mobile: boolean;
  email: boolean;
  description: string;
}

interface ComplianceAlert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  read: boolean;
  actionRequired: boolean;
  deadline?: string;
}

const ComplianceAlerts: React.FC = () => {
  const { toast } = useToast();
  const [deviceConnected, setDeviceConnected] = useState(true);
  
  const [alertPreferences, setAlertPreferences] = useState<AlertPreference[]>([
    {
      id: 'pref1',
      type: 'Audit Deadlines',
      enabled: true,
      mobile: true,
      email: true,
      description: 'Alerts for upcoming compliance audit deadlines'
    },
    {
      id: 'pref2',
      type: 'Policy Updates',
      enabled: true,
      mobile: true,
      email: true,
      description: 'Notifications when compliance policies are updated'
    },
    {
      id: 'pref3',
      type: 'Compliance Scores',
      enabled: true,
      mobile: false,
      email: true,
      description: 'Updates on changes to compliance scores'
    },
    {
      id: 'pref4',
      type: 'Training Reminders',
      enabled: true,
      mobile: true,
      email: true,
      description: 'Staff training deadline reminders'
    }
  ]);

  const [alerts, setAlerts] = useState<ComplianceAlert[]>([
    {
      id: 'alert1',
      title: 'Annual Risk Assessment Due',
      description: 'Complete the annual security risk assessment in the next 14 days.',
      timestamp: '2025-05-16T10:30:00Z',
      severity: 'warning',
      read: false,
      actionRequired: true,
      deadline: '2025-05-31'
    },
    {
      id: 'alert2',
      title: 'Staff Training Compliance',
      description: '12 staff members have not completed required security training.',
      timestamp: '2025-05-15T14:45:00Z',
      severity: 'warning',
      read: false,
      actionRequired: true,
      deadline: '2025-05-25'
    },
    {
      id: 'alert3',
      title: 'HIPAA Policy Updated',
      description: 'Notice of Privacy Practices has been updated with new provisions.',
      timestamp: '2025-05-12T09:15:00Z',
      severity: 'info',
      read: true,
      actionRequired: false
    },
    {
      id: 'alert4',
      title: 'Security Incident Detected',
      description: 'Unusual login pattern detected for user account jsmith@example.com.',
      timestamp: '2025-05-10T23:05:00Z',
      severity: 'critical',
      read: true,
      actionRequired: true
    }
  ]);

  const toggleAlertRead = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: !alert.read } : alert
    ));
  };

  const togglePreference = (id: string, field: 'enabled' | 'mobile' | 'email') => {
    setAlertPreferences(alertPreferences.map(pref => 
      pref.id === id ? { ...pref, [field]: !pref[field] } : pref
    ));
    
    const preference = alertPreferences.find(p => p.id === id);
    if (preference) {
      toast({
        title: `${preference.type} Alerts ${field === 'enabled' ? 'Updated' : `${field} Notifications ${!preference[field] ? 'Enabled' : 'Disabled'}`}`,
        description: field === 'enabled' 
          ? `Notifications ${!preference.enabled ? 'enabled' : 'disabled'} for ${preference.type}`
          : `${field.charAt(0).toUpperCase() + field.slice(1)} notifications ${!preference[field] ? 'enabled' : 'disabled'} for ${preference.type}`,
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info': return <Bell className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5 text-primary" />
              Mobile Compliance Alerts
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Real-time compliance notifications across devices
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mobile Device</span>
            <Switch 
              checked={deviceConnected} 
              onCheckedChange={() => {
                setDeviceConnected(!deviceConnected);
                toast({
                  title: deviceConnected ? "Mobile Disconnected" : "Mobile Connected",
                  description: deviceConnected 
                    ? "Compliance alerts will not be sent to your mobile device"
                    : "Compliance alerts will now be sent to your mobile device",
                });
              }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Recent Alerts</h3>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex items-start p-3 border rounded-lg ${
                    !alert.read ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="mr-3 mt-0.5">{getSeverityIcon(alert.severity)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleAlertRead(alert.id)}
                      >
                        {alert.read 
                          ? <Bell className="h-4 w-4" /> 
                          : <Check className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-muted-foreground">
                        {formatDate(alert.timestamp)} at {formatTime(alert.timestamp)}
                      </div>
                      
                      {alert.deadline && (
                        <div className="flex items-center text-xs font-medium">
                          <Clock className="h-3 w-3 mr-1 text-amber-500" />
                          Due: {formatDate(alert.deadline)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Alert Settings</h3>
            <div className="space-y-3">
              {alertPreferences.map((pref) => (
                <div key={pref.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{pref.type}</h4>
                    <Switch 
                      checked={pref.enabled} 
                      onCheckedChange={() => togglePreference(pref.id, 'enabled')}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">{pref.description}</p>
                  
                  {pref.enabled && (
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Mobile</span>
                        <Switch 
                          checked={pref.mobile} 
                          onCheckedChange={() => togglePreference(pref.id, 'mobile')}
                          disabled={!deviceConnected}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Email</span>
                        <Switch 
                          checked={pref.email} 
                          onCheckedChange={() => togglePreference(pref.id, 'email')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full flex items-center gap-1">
          <Bell className="h-4 w-4 mr-1" />
          Manage All Alert Preferences
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ComplianceAlerts;
