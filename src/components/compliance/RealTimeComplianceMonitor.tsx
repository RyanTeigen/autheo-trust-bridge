
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Info, Activity, Lock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ComplianceProgressIndicator from '@/components/ui/ComplianceProgressIndicator';
import AccessPatternChart from './monitoring/AccessPatternChart';
import SecurityAlertsList from './monitoring/SecurityAlertsList';
import ComplianceMetricCard from './monitoring/ComplianceMetricCard';
import { SecurityAlert, AccessPattern } from './monitoring/types';

// Sample data - In a real implementation, this would come from an API
const sampleAlerts: SecurityAlert[] = [
  { 
    id: '1', 
    severity: 'critical', 
    message: 'Multiple failed login attempts detected', 
    timestamp: new Date().toISOString(),
    source: 'Authentication System',
    resolved: false
  },
  { 
    id: '2', 
    severity: 'warning', 
    message: 'Unusual data access pattern detected', 
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    source: 'Data Access Monitor',
    resolved: false
  },
  { 
    id: '3', 
    severity: 'info', 
    message: 'Security scan completed successfully', 
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    source: 'Security Scanner',
    resolved: true
  },
];

// Sample access patterns data
const sampleAccessPatterns: AccessPattern[] = [
  { hour: '00:00', count: 12, anomalyScore: 0 },
  { hour: '01:00', count: 8, anomalyScore: 0 },
  { hour: '02:00', count: 5, anomalyScore: 0 },
  { hour: '03:00', count: 3, anomalyScore: 0 },
  { hour: '04:00', count: 2, anomalyScore: 0 },
  { hour: '05:00', count: 7, anomalyScore: 0 },
  { hour: '06:00', count: 15, anomalyScore: 0 },
  { hour: '07:00', count: 25, anomalyScore: 0 },
  { hour: '08:00', count: 38, anomalyScore: 0 },
  { hour: '09:00', count: 56, anomalyScore: 0 },
  { hour: '10:00', count: 72, anomalyScore: 0 },
  { hour: '11:00', count: 85, anomalyScore: 0 },
  { hour: '12:00', count: 76, anomalyScore: 0 },
  { hour: '13:00', count: 68, anomalyScore: 0 },
  { hour: '14:00', count: 75, anomalyScore: 0 },
  { hour: '15:00', count: 69, anomalyScore: 0 },
  { hour: '16:00', count: 46, anomalyScore: 0 },
  { hour: '17:00', count: 30, anomalyScore: 0 },
  { hour: '18:00', count: 22, anomalyScore: 0 },
  { hour: '19:00', count: 41, anomalyScore: 1 }, // Anomaly
  { hour: '20:00', count: 19, anomalyScore: 0 },
  { hour: '21:00', count: 14, anomalyScore: 0 },
  { hour: '22:00', count: 9, anomalyScore: 0 },
  { hour: '23:00', count: 7, anomalyScore: 0 },
];

interface RealTimeComplianceMonitorProps {
  className?: string;
}

const RealTimeComplianceMonitor: React.FC<RealTimeComplianceMonitorProps> = ({ className }) => {
  const [overallScore, setOverallScore] = useState(94);
  const [activeAlerts, setActiveAlerts] = useState<SecurityAlert[]>(sampleAlerts);
  const [accessData, setAccessData] = useState<AccessPattern[]>(sampleAccessPatterns);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update last updated time
      setLastUpdated(new Date());
      
      // Randomly fluctuate the compliance score slightly
      setOverallScore(prev => {
        const change = Math.random() > 0.7 ? Math.floor(Math.random() * 3) - 1 : 0;
        return Math.min(Math.max(prev + change, 80), 100); // Keep between 80-100
      });
      
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical' && !alert.resolved);
  const warningAlerts = activeAlerts.filter(alert => alert.severity === 'warning' && !alert.resolved);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center">
              <Shield className="mr-2 h-5 w-5 text-autheo-primary" /> 
              Real-Time Compliance Monitor
            </CardTitle>
            <CardDescription>
              Live monitoring of HIPAA compliance metrics and security events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-100 text-slate-800">
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
            {criticalAlerts.length > 0 && (
              <Badge variant="destructive">
                {criticalAlerts.length} Critical
              </Badge>
            )}
            {warningAlerts.length > 0 && (
              <Badge variant="warning" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                {warningAlerts.length} Warnings
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ComplianceMetricCard 
              title="Overall Compliance" 
              score={overallScore} 
              icon={<Shield className="h-5 w-5" />} 
              trend="stable"
            />
            <ComplianceMetricCard 
              title="Privacy Controls" 
              score={98} 
              icon={<Lock className="h-5 w-5" />} 
              trend="up"
            />
            <ComplianceMetricCard 
              title="Security Rules" 
              score={92} 
              icon={<AlertTriangle className="h-5 w-5" />} 
              trend="down"
              description="2 items require attention"
            />
          </div>
          
          {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
            <Alert variant={criticalAlerts.length > 0 ? "destructive" : "warning"} className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {criticalAlerts.length > 0 
                  ? "Critical Security Alerts" 
                  : "Warning Alerts"}
              </AlertTitle>
              <AlertDescription>
                {criticalAlerts.length > 0 
                  ? `${criticalAlerts.length} critical security issues require immediate attention.` 
                  : `${warningAlerts.length} security warnings need review.`}
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="access" className="w-full">
            <TabsList>
              <TabsTrigger value="access">Access Patterns</TabsTrigger>
              <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            </TabsList>
            <TabsContent value="access" className="p-4 border rounded-md mt-4">
              <h4 className="text-lg font-medium mb-4">Data Access Patterns (24hr)</h4>
              <AccessPatternChart data={accessData} />
            </TabsContent>
            <TabsContent value="alerts" className="p-4 border rounded-md mt-4">
              <h4 className="text-lg font-medium mb-4">Recent Security Events</h4>
              <SecurityAlertsList alerts={activeAlerts} />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeComplianceMonitor;
