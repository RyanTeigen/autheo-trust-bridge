
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ComplianceAlert {
  id: string;
  severity: string;
  message: string;
  deadline: string;
}

interface ComplianceAlertsListProps {
  complianceAlerts: ComplianceAlert[];
}

const ComplianceAlertsList: React.FC<ComplianceAlertsListProps> = ({ complianceAlerts }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Compliance Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {complianceAlerts.map((alert) => (
            <Alert key={alert.id} className={getSeverityColor(alert.severity)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs mt-1">Deadline: {alert.deadline}</p>
                  </div>
                  <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceAlertsList;
