import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import HealthAlert, { HealthAlertData } from './HealthAlert';

interface AlertsPanelProps {
  alerts: HealthAlertData[];
  onResolveAlert: (alertId: number) => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, onResolveAlert }) => {
  const activeAlerts = alerts.filter(alert => !alert.resolved);

  if (activeAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-700">
          <AlertTriangle className="h-5 w-5" />
          Active Health Alerts ({activeAlerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <HealthAlert 
              key={alert.id} 
              alert={alert} 
              onResolve={onResolveAlert} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;