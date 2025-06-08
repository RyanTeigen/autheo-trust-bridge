
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X, Clock, Heart, Pill } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MedicalAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'medication' | 'vitals' | 'appointment' | 'test-result';
  title: string;
  message: string;
  timestamp: string;
  actionRequired?: boolean;
  expiresAt?: string;
}

const MedicalAlerts: React.FC = () => {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<MedicalAlert[]>([
    {
      id: '1',
      type: 'critical',
      category: 'medication',
      title: 'Medication Interaction Warning',
      message: 'Potential interaction between Warfarin and Aspirin. Consult your doctor immediately.',
      timestamp: new Date().toISOString(),
      actionRequired: true
    },
    {
      id: '2',
      type: 'warning',
      category: 'vitals',
      title: 'Blood Pressure Alert',
      message: 'Your recent blood pressure reading (150/95) is elevated. Monitor closely.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      actionRequired: true
    },
    {
      id: '3',
      type: 'info',
      category: 'appointment',
      title: 'Upcoming Appointment Reminder',
      message: 'Annual physical exam scheduled for tomorrow at 2:00 PM.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actionRequired: false
    }
  ]);

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'vitals': return <Heart className="h-4 w-4" />;
      case 'appointment': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-950/20';
      case 'warning': return 'border-orange-500 bg-orange-950/20';
      case 'info': return 'border-blue-500 bg-blue-950/20';
      default: return 'border-slate-500 bg-slate-950/20';
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast({
      title: "Alert dismissed",
      description: "The medical alert has been removed from your list.",
    });
  };

  const acknowledgeAlert = (id: string) => {
    toast({
      title: "Alert acknowledged",
      description: "Your healthcare provider has been notified.",
    });
  };

  if (alerts.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6 text-center">
          <Heart className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-slate-300">No active medical alerts</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Medical Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 border-l-4 border-b border-slate-700 last:border-b-0 ${getAlertStyle(alert.type)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    {getAlertIcon(alert.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-slate-200">{alert.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          alert.type === 'critical' ? 'text-red-400 border-red-400' :
                          alert.type === 'warning' ? 'text-orange-400 border-orange-400' :
                          'text-blue-400 border-blue-400'
                        }`}
                      >
                        {alert.type.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300 mb-2">{alert.message}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {alert.actionRequired && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-autheo-primary text-autheo-primary hover:bg-autheo-primary hover:text-autheo-dark"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-slate-400 hover:text-slate-300"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicalAlerts;
