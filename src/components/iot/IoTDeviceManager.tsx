
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wifi, WifiOff, Activity, Heart, Thermometer, BarChart3, Plus, Settings } from 'lucide-react';
import SmartContractsService, { IoTDevice, IoTDataPoint } from '@/services/blockchain/SmartContractsService';

const IoTDeviceManager: React.FC = () => {
  const { toast } = useToast();
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const smartContractsService = SmartContractsService.getInstance();

  // Form state for adding new device
  const [newDevice, setNewDevice] = useState({
    deviceType: 'heart_rate_monitor' as IoTDevice['deviceType'],
    manufacturer: '',
    model: '',
    serialNumber: '',
    userId: 'current-user' // Would be populated from auth context
  });

  useEffect(() => {
    loadDemoDevices();
  }, []);

  const loadDemoDevices = () => {
    // Demo data for IoT devices
    const demoDevices: IoTDevice[] = [
      {
        id: 'device-1',
        userId: 'current-user',
        deviceType: 'heart_rate_monitor',
        manufacturer: 'Apple',
        model: 'Apple Watch Series 9',
        serialNumber: 'AW123456789',
        isConnected: true,
        lastSyncAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
        encryptionKey: 'demo-key-1'
      },
      {
        id: 'device-2',
        userId: 'current-user',
        deviceType: 'blood_glucose_meter',
        manufacturer: 'Dexcom',
        model: 'G7 CGM',
        serialNumber: 'DX987654321',
        isConnected: true,
        lastSyncAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        encryptionKey: 'demo-key-2'
      },
      {
        id: 'device-3',
        userId: 'current-user',
        deviceType: 'blood_pressure_monitor',
        manufacturer: 'Omron',
        model: 'HeartGuide',
        serialNumber: 'OM456789123',
        isConnected: false,
        lastSyncAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        encryptionKey: 'demo-key-3'
      }
    ];
    setDevices(demoDevices);
  };

  const handleAddDevice = async () => {
    try {
      setLoading(true);
      
      const device = await smartContractsService.registerIoTDevice({
        ...newDevice,
        isConnected: false
      });

      setDevices([...devices, device]);
      setShowAddForm(false);
      setNewDevice({
        deviceType: 'heart_rate_monitor',
        manufacturer: '',
        model: '',
        serialNumber: '',
        userId: 'current-user'
      });

      toast({
        title: "Device Registered",
        description: `${device.manufacturer} ${device.model} has been added to your account.`,
      });
    } catch (error) {
      console.error('Error adding device:', error);
      toast({
        title: "Registration Failed",
        description: "Could not register the device. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const simulateDataSync = async (deviceId: string) => {
    try {
      const device = devices.find(d => d.id === deviceId);
      if (!device) return;

      setLoading(true);

      // Generate simulated data based on device type
      const dataPoints = generateSimulatedData(device.deviceType);
      
      await smartContractsService.processIoTData(deviceId, dataPoints);

      // Update device last sync time
      setDevices(devices.map(d => 
        d.id === deviceId 
          ? { ...d, lastSyncAt: new Date().toISOString(), isConnected: true }
          : d
      ));

      toast({
        title: "Data Synced",
        description: `Successfully synced ${dataPoints.length} data points from ${device.manufacturer} ${device.model}.`,
      });
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: "Sync Failed",
        description: "Could not sync device data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSimulatedData = (deviceType: IoTDevice['deviceType']): Omit<IoTDataPoint, 'id' | 'deviceId'>[] => {
    const now = new Date();
    const dataPoints: Omit<IoTDataPoint, 'id' | 'deviceId'>[] = [];

    switch (deviceType) {
      case 'heart_rate_monitor':
        for (let i = 0; i < 10; i++) {
          dataPoints.push({
            timestamp: new Date(now.getTime() - i * 60000).toISOString(),
            dataType: 'heart_rate',
            value: 65 + Math.floor(Math.random() * 40),
            unit: 'bpm',
            confidence: 0.85 + Math.random() * 0.15,
            isValidated: false
          });
        }
        break;
      case 'blood_glucose_meter':
        for (let i = 0; i < 5; i++) {
          dataPoints.push({
            timestamp: new Date(now.getTime() - i * 240000).toISOString(),
            dataType: 'blood_glucose',
            value: 80 + Math.floor(Math.random() * 60),
            unit: 'mg/dL',
            confidence: 0.92 + Math.random() * 0.08,
            isValidated: false
          });
        }
        break;
      case 'blood_pressure_monitor':
        for (let i = 0; i < 3; i++) {
          dataPoints.push({
            timestamp: new Date(now.getTime() - i * 480000).toISOString(),
            dataType: 'blood_pressure_systolic',
            value: 110 + Math.floor(Math.random() * 30),
            unit: 'mmHg',
            confidence: 0.88 + Math.random() * 0.12,
            isValidated: false
          });
        }
        break;
    }

    return dataPoints;
  };

  const getDeviceIcon = (deviceType: IoTDevice['deviceType']) => {
    switch (deviceType) {
      case 'heart_rate_monitor':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'blood_glucose_meter':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'blood_pressure_monitor':
        return <BarChart3 className="h-5 w-5 text-green-500" />;
      case 'smart_inhaler':
        return <Thermometer className="h-5 w-5 text-purple-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDeviceType = (deviceType: string) => {
    return deviceType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-autheo-primary flex items-center gap-2">
              <Activity className="h-6 w-6" />
              IoT Device Manager
            </CardTitle>
            <CardDescription className="text-slate-300">
              Manage and monitor your connected health devices
            </CardDescription>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-autheo-primary hover:bg-autheo-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {showAddForm && (
          <Card className="bg-slate-700/50 border-slate-600">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Register New Device</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device Type</label>
                  <Select 
                    value={newDevice.deviceType} 
                    onValueChange={(value: IoTDevice['deviceType']) => 
                      setNewDevice({ ...newDevice, deviceType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heart_rate_monitor">Heart Rate Monitor</SelectItem>
                      <SelectItem value="blood_glucose_meter">Blood Glucose Meter</SelectItem>
                      <SelectItem value="blood_pressure_monitor">Blood Pressure Monitor</SelectItem>
                      <SelectItem value="smart_inhaler">Smart Inhaler</SelectItem>
                      <SelectItem value="fitness_tracker">Fitness Tracker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Manufacturer</label>
                  <Input 
                    value={newDevice.manufacturer}
                    onChange={(e) => setNewDevice({ ...newDevice, manufacturer: e.target.value })}
                    placeholder="e.g., Apple, Dexcom, Omron"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <Input 
                    value={newDevice.model}
                    onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                    placeholder="Device model"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Serial Number</label>
                  <Input 
                    value={newDevice.serialNumber}
                    onChange={(e) => setNewDevice({ ...newDevice, serialNumber: e.target.value })}
                    placeholder="Device serial number"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleAddDevice}
                  disabled={loading || !newDevice.manufacturer || !newDevice.model || !newDevice.serialNumber}
                  className="bg-autheo-primary hover:bg-autheo-primary/90"
                >
                  {loading ? 'Registering...' : 'Register Device'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Connected Devices</h3>
          
          {devices.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No devices registered yet</p>
              <p className="text-sm">Add your first IoT device to start monitoring your health data</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {devices.map((device) => (
                <Card key={device.id} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(device.deviceType)}
                        <div>
                          <h4 className="font-medium">{device.manufacturer} {device.model}</h4>
                          <p className="text-sm text-slate-400">{formatDeviceType(device.deviceType)}</p>
                          <p className="text-xs text-slate-500">SN: {device.serialNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge 
                            variant={device.isConnected ? "default" : "secondary"}
                            className={device.isConnected ? "bg-green-600" : "bg-red-600"}
                          >
                            {device.isConnected ? (
                              <>
                                <Wifi className="h-3 w-3 mr-1" />
                                Connected
                              </>
                            ) : (
                              <>
                                <WifiOff className="h-3 w-3 mr-1" />
                                Disconnected
                              </>
                            )}
                          </Badge>
                          {device.lastSyncAt && (
                            <p className="text-xs text-slate-400 mt-1">
                              Last sync: {new Date(device.lastSyncAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => simulateDataSync(device.id)}
                            disabled={loading}
                            className="bg-autheo-primary hover:bg-autheo-primary/90"
                          >
                            Sync Data
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default IoTDeviceManager;
