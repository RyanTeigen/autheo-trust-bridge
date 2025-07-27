import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Zap, 
  AlertTriangle,
  Wifi,
  WifiOff,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { useHealthcareMonitoring } from '@/hooks/useHealthcareMonitoring';

const RealTimeHealthMonitoring = () => {
  const { trackVitalSigns, trackMedicalAlert } = useHealthcareMonitoring();
  const [isConnected, setIsConnected] = useState(true);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  // Mock real-time vital signs data
  const [vitals, setVitals] = useState({
    heartRate: { current: 72, status: 'normal', trend: 'stable' },
    bloodPressure: { systolic: 120, diastolic: 80, status: 'normal', trend: 'stable' },
    temperature: { current: 98.6, status: 'normal', trend: 'stable' },
    oxygenSaturation: { current: 98, status: 'normal', trend: 'stable' },
    respiratoryRate: { current: 16, status: 'normal', trend: 'stable' }
  });

  // Historical data for charts
  const [historicalData, setHistoricalData] = useState([
    { time: '09:00', heartRate: 68, bloodPressure: 118, temperature: 98.4, oxygen: 99 },
    { time: '09:15', heartRate: 70, bloodPressure: 120, temperature: 98.5, oxygen: 98 },
    { time: '09:30', heartRate: 72, bloodPressure: 122, temperature: 98.6, oxygen: 98 },
    { time: '09:45', heartRate: 74, bloodPressure: 119, temperature: 98.7, oxygen: 97 },
    { time: '10:00', heartRate: 72, bloodPressure: 120, temperature: 98.6, oxygen: 98 },
    { time: '10:15', heartRate: 71, bloodPressure: 118, temperature: 98.5, oxygen: 99 }
  ]);

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'vital_threshold',
      severity: 'medium',
      message: 'Heart rate slightly elevated',
      timestamp: new Date().toISOString(),
      resolved: false
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeEnabled) return;

    const interval = setInterval(() => {
      // Simulate vital sign fluctuations
      setVitals(prev => ({
        heartRate: {
          ...prev.heartRate,
          current: Math.max(60, Math.min(100, prev.heartRate.current + (Math.random() - 0.5) * 4))
        },
        bloodPressure: {
          ...prev.bloodPressure,
          systolic: Math.max(100, Math.min(140, prev.bloodPressure.systolic + (Math.random() - 0.5) * 6)),
          diastolic: Math.max(60, Math.min(90, prev.bloodPressure.diastolic + (Math.random() - 0.5) * 4))
        },
        temperature: {
          ...prev.temperature,
          current: Math.max(97, Math.min(100, prev.temperature.current + (Math.random() - 0.5) * 0.2))
        },
        oxygenSaturation: {
          ...prev.oxygenSaturation,
          current: Math.max(95, Math.min(100, prev.oxygenSaturation.current + (Math.random() - 0.5) * 2))
        },
        respiratoryRate: {
          ...prev.respiratoryRate,
          current: Math.max(12, Math.min(20, prev.respiratoryRate.current + (Math.random() - 0.5) * 2))
        }
      }));

      // Update historical data
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      
      setHistoricalData(prev => {
        const newData = [...prev.slice(-5), {
          time: timeStr,
          heartRate: Math.round(vitals.heartRate.current),
          bloodPressure: Math.round(vitals.bloodPressure.systolic),
          temperature: Number(vitals.temperature.current.toFixed(1)),
          oxygen: Math.round(vitals.oxygenSaturation.current)
        }];
        return newData;
      });
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [realTimeEnabled, vitals]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-blue-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-green-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleAlertResolve = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const simulateAlert = () => {
    const newAlert = {
      id: Date.now(),
      type: 'vital_abnormal',
      severity: 'high',
      message: 'Oxygen saturation below normal range',
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
    trackMedicalAlert('oxygen_saturation_low', 'high', {
      current_value: vitals.oxygenSaturation.current,
      normal_range: '95-100%'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Real-Time Health Monitoring</h2>
          <p className="text-muted-foreground">
            Continuous monitoring of vital signs and health metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Real-time monitoring</span>
            <Switch 
              checked={realTimeEnabled} 
              onCheckedChange={setRealTimeEnabled}
            />
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.filter(alert => !alert.resolved).length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" />
              Active Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.filter(alert => !alert.resolved).map((alert) => (
                <Alert key={alert.id}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <Button size="sm" onClick={() => handleAlertResolve(alert.id)}>
                      Acknowledge
                    </Button>
                  </AlertTitle>
                  <AlertDescription>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vital Signs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{Math.round(vitals.heartRate.current)}</div>
              {getTrendIcon(vitals.heartRate.trend)}
            </div>
            <p className="text-xs text-muted-foreground">bpm</p>
            <Badge variant="outline" className={getStatusColor(vitals.heartRate.status)}>
              {vitals.heartRate.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Pressure</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {Math.round(vitals.bloodPressure.systolic)}/{Math.round(vitals.bloodPressure.diastolic)}
              </div>
              {getTrendIcon(vitals.bloodPressure.trend)}
            </div>
            <p className="text-xs text-muted-foreground">mmHg</p>
            <Badge variant="outline" className={getStatusColor(vitals.bloodPressure.status)}>
              {vitals.bloodPressure.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temperature</CardTitle>
            <Thermometer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{vitals.temperature.current.toFixed(1)}</div>
              {getTrendIcon(vitals.temperature.trend)}
            </div>
            <p className="text-xs text-muted-foreground">°F</p>
            <Badge variant="outline" className={getStatusColor(vitals.temperature.status)}>
              {vitals.temperature.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oxygen Saturation</CardTitle>
            <Droplets className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{Math.round(vitals.oxygenSaturation.current)}</div>
              {getTrendIcon(vitals.oxygenSaturation.trend)}
            </div>
            <p className="text-xs text-muted-foreground">%</p>
            <Badge variant="outline" className={getStatusColor(vitals.oxygenSaturation.status)}>
              {vitals.oxygenSaturation.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respiratory Rate</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{Math.round(vitals.respiratoryRate.current)}</div>
              {getTrendIcon(vitals.respiratoryRate.trend)}
            </div>
            <p className="text-xs text-muted-foreground">breaths/min</p>
            <Badge variant="outline" className={getStatusColor(vitals.respiratoryRate.status)}>
              {vitals.respiratoryRate.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Vital Trends</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="devices">Connected Devices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Vital Signs Trends</CardTitle>
              <CardDescription>
                Live monitoring of key health indicators over the last hour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" domain={[60, 140]} />
                  <YAxis yAxisId="right" orientation="right" domain={[95, 100]} />
                  <Tooltip />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="heartRate" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Heart Rate (bpm)"
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="bloodPressure" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Systolic BP (mmHg)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="oxygen" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    name="O2 Saturation (%)"
                  />
                  <ReferenceLine yAxisId="left" y={120} stroke="#ef4444" strokeDasharray="5 5" />
                  <ReferenceLine yAxisId="right" y={95} stroke="#06b6d4" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Health Data</CardTitle>
              <CardDescription>
                Past vital sign measurements and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">24h</p>
                    <p className="text-sm text-muted-foreground">Monitoring Duration</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1,440</p>
                    <p className="text-sm text-muted-foreground">Data Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Alerts Generated</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">98.5%</p>
                    <p className="text-sm text-muted-foreground">Data Accuracy</p>
                  </div>
                </div>
                <Button className="w-full" onClick={simulateAlert}>
                  <Clock className="h-4 w-4 mr-2" />
                  Generate Test Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Connected Devices</CardTitle>
                <CardDescription>Active monitoring devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Apple Watch Series 9</span>
                    <Badge variant="outline" className="text-green-600">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pulse Oximeter Pro</span>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Smart Blood Pressure Cuff</span>
                    <Badge variant="outline" className="text-yellow-600">Standby</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Status</CardTitle>
                <CardDescription>Monitoring device health</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Battery Level</span>
                    <span className="text-sm font-medium">87%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Signal Strength</span>
                    <span className="text-sm font-medium">Strong</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Sync</span>
                    <span className="text-sm font-medium">2 min ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Preferences</CardTitle>
              <CardDescription>Configure your health monitoring settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Alert Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive alerts for abnormal readings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Share with Provider</p>
                    <p className="text-xs text-muted-foreground">Automatically share data with healthcare team</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Emergency Contacts</p>
                    <p className="text-xs text-muted-foreground">Alert emergency contacts for critical values</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeHealthMonitoring;