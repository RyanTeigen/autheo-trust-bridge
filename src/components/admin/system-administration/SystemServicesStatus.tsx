
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, AlertTriangle, Activity } from 'lucide-react';

interface SystemService {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  uptime: string;
  responseTime: string;
}

interface SystemServicesStatusProps {
  systemServices: SystemService[];
}

const SystemServicesStatus: React.FC<SystemServicesStatusProps> = ({ systemServices }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          System Services
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemServices.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(service.status)}
                <div>
                  <h4 className="font-medium">{service.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Uptime: {service.uptime} | Response: {service.responseTime}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(service.status)}>
                {service.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemServicesStatus;
