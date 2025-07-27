import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Activity, 
  Thermometer, 
  Droplets, 
  Zap, 
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { useAtomicVitals } from '@/hooks/useAtomicVitals';
import { useHealthcareMonitoring } from '@/hooks/useHealthcareMonitoring';
import VitalSignCard from '@/components/real-time-health/VitalSignCard';
import RealTimeVitalChart from '@/components/real-time-health/RealTimeVitalChart';
import AlertsPanel from '@/components/real-time-health/AlertsPanel';
import { HealthAlertData } from '@/components/real-time-health/HealthAlert';

const RealTimeHealthMonitor = () => {
  const { 
    decryptedVitals, 
    realTimeData, 
    trends, 
    loading, 
    error, 
    isRealTimeEnabled, 
    setIsRealTimeEnabled 
  } = useAtomicVitals();
  
  const { trackMedicalAlert } = useHealthcareMonitoring();
  const [isConnected, setIsConnected] = useState(true);
  const [alerts, setAlerts] = useState<HealthAlertData[]>([
    {
      id: 1,
      type: 'vital_threshold',
      severity: 'medium',
      message: 'Heart rate slightly elevated',
      timestamp: new Date().toISOString(),
      resolved: false
    }
  ]);

  // Mock historical data for charts (replace with real data)
  const [historicalData] = useState([
    { time: '09:00', heartRate: 68, bloodPressure: 118, temperature: 98.4, oxygen: 99 },
    { time: '09:15', heartRate: 70, bloodPressure: 120, temperature: 98.5, oxygen: 98 },
    { time: '09:30', heartRate: 72, bloodPressure: 122, temperature: 98.6, oxygen: 98 },
    { time: '09:45', heartRate: 74, bloodPressure: 119, temperature: 98.7, oxygen: 97 },
    { time: '10:00', heartRate: 72, bloodPressure: 120, temperature: 98.6, oxygen: 98 },
    { time: '10:15', heartRate: 71, bloodPressure: 118, temperature: 98.5, oxygen: 99 }
  ]);

  const handleAlertResolve = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const simulateAlert = () => {
    const newAlert: HealthAlertData = {
      id: Date.now(),
      type: 'vital_abnormal',
      severity: 'high',
      message: 'Oxygen saturation below normal range',
      timestamp: new Date().toISOString(),
      resolved: false
    };
    
    setAlerts(prev => [newAlert, ...prev.slice(0, 4)]);
    trackMedicalAlert('oxygen_saturation_low', 'high', {
      current_value: 95,
      normal_range: '95-100%'
    });
  };

  const getVitalCardData = (dataType: string) => {
    const realTime = realTimeData[dataType];
    const decrypted = decryptedVitals.find(v => v.dataType === dataType);
    
    if (realTime) {
      return {
        value: realTime.current.toFixed(1),
        status: realTime.status,
        trend: realTime.trend,
        unit: realTime.unit
      };
    } else if (decrypted) {
      return {
        value: decrypted.value,
        status: decrypted.status,
        trend: decrypted.trend,
        unit: decrypted.unit || ''
      };
    }
    
    return {
      value: '--',
      status: 'normal' as const,
      trend: 'stable' as const,
      unit: ''
    };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading real-time health data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Real-Time Health Monitoring</h3>
          <p className="text-sm text-muted-foreground">
            Continuous monitoring of vital signs and health metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm">Real-time monitoring</span>
            <Switch 
              checked={isRealTimeEnabled} 
              onCheckedChange={setIsRealTimeEnabled}
            />
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </div>

      {/* Active Alerts */}
      <AlertsPanel alerts={alerts} onResolveAlert={handleAlertResolve} />

      {/* Vital Signs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <VitalSignCard
          title="Heart Rate"
          {...getVitalCardData('heart_rate')}
          icon={<Heart className="h-4 w-4 text-red-600" />}
        />
        
        <VitalSignCard
          title="Blood Pressure"
          {...getVitalCardData('blood_pressure_systolic')}
          icon={<Activity className="h-4 w-4 text-blue-600" />}
        />
        
        <VitalSignCard
          title="Temperature"
          {...getVitalCardData('temperature')}
          icon={<Thermometer className="h-4 w-4 text-orange-600" />}
        />
        
        <VitalSignCard
          title="Oxygen Saturation"
          {...getVitalCardData('oxygen_saturation')}
          icon={<Droplets className="h-4 w-4 text-cyan-600" />}
        />
        
        <VitalSignCard
          title="Respiratory Rate"
          {...getVitalCardData('respiratory_rate')}
          icon={<Zap className="h-4 w-4 text-purple-600" />}
        />
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Vital Trends</TabsTrigger>
          <TabsTrigger value="devices">Connected Devices</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <RealTimeVitalChart
            title="Real-Time Vital Signs Trends"
            description="Live monitoring of key health indicators over the last hour"
            data={historicalData}
            lines={[
              {
                dataKey: 'heartRate',
                stroke: '#ef4444',
                name: 'Heart Rate (bpm)',
                yAxisId: 'left'
              },
              {
                dataKey: 'bloodPressure',
                stroke: '#3b82f6',
                name: 'Systolic BP (mmHg)',
                yAxisId: 'left'
              },
              {
                dataKey: 'oxygen',
                stroke: '#06b6d4',
                name: 'O2 Saturation (%)',
                yAxisId: 'right'
              }
            ]}
            referenceLines={[
              { y: 120, stroke: '#ef4444', yAxisId: 'left' },
              { y: 95, stroke: '#06b6d4', yAxisId: 'right' }
            ]}
            leftDomain={[60, 140]}
            rightDomain={[95, 100]}
          />
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Connected Devices</CardTitle>
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
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Battery Level</span>
                    <Badge variant="outline" className="text-green-600">85%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Signal Strength</span>
                    <Badge variant="outline" className="text-green-600">Strong</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Sync</span>
                    <Badge variant="outline" className="text-green-600">Up to date</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historical Health Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">24h</p>
                    <p className="text-sm text-muted-foreground">Monitoring Duration</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{decryptedVitals.length}</p>
                    <p className="text-sm text-muted-foreground">Data Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{alerts.length}</p>
                    <p className="text-sm text-muted-foreground">Total Alerts</p>
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
      </Tabs>
    </div>
  );
};

export default RealTimeHealthMonitor;