import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Smartphone, 
  Watch, 
  Heart, 
  Share2, 
  CheckCircle, 
  AlertCircle,
  Settings,
  RefreshCw,
  Shield
} from 'lucide-react';

interface FitnessDevice {
  id: string;
  name: string;
  icon: React.ReactNode;
  isConnected: boolean;
  lastSync?: string;
  dataTypes: string[];
  sharingEnabled: boolean;
}

const FitnessDeviceIntegration: React.FC = () => {
  const { toast } = useToast();
  const [devices, setDevices] = useState<FitnessDevice[]>([
    {
      id: 'strava',
      name: 'Strava',
      icon: <Activity className="h-5 w-5" />,
      isConnected: false,
      dataTypes: ['Running', 'Cycling', 'Swimming', 'Heart Rate'],
      sharingEnabled: false
    },
    {
      id: 'garmin',
      name: 'Garmin Connect',
      icon: <Watch className="h-5 w-5" />,
      isConnected: false,
      dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Workouts'],
      sharingEnabled: false
    },
    {
      id: 'whoop',
      name: 'WHOOP',
      icon: <Heart className="h-5 w-5" />,
      isConnected: false,
      dataTypes: ['Recovery', 'Strain', 'Sleep', 'Heart Rate Variability'],
      sharingEnabled: false
    },
    {
      id: 'oura',
      name: 'Oura Ring',
      icon: <Smartphone className="h-5 w-5" />,
      isConnected: false,
      dataTypes: ['Sleep', 'Activity', 'Readiness', 'Temperature'],
      sharingEnabled: false
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      icon: <Activity className="h-5 w-5" />,
      isConnected: false,
      dataTypes: ['Steps', 'Heart Rate', 'Sleep', 'Exercise'],
      sharingEnabled: false
    }
  ]);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleDeviceConnection = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    if (device.isConnected) {
      // Disconnect device
      setDevices(prev => prev.map(d => 
        d.id === deviceId 
          ? { ...d, isConnected: false, lastSync: undefined, sharingEnabled: false }
          : d
      ));
      
      toast({
        title: "Device Disconnected",
        description: `${device.name} has been disconnected from your account.`,
      });
    } else {
      // Connect device (simulate OAuth flow)
      toast({
        title: "Connecting...",
        description: `Redirecting to ${device.name} for authorization.`,
      });

      // Simulate connection delay
      setTimeout(() => {
        setDevices(prev => prev.map(d => 
          d.id === deviceId 
            ? { ...d, isConnected: true, lastSync: new Date().toISOString() }
            : d
        ));
        
        toast({
          title: "Device Connected",
          description: `${device.name} has been successfully connected to your account.`,
        });
      }, 2000);
    }
  };

  const handleSharingToggle = (deviceId: string, enabled: boolean) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, sharingEnabled: enabled } : d
    ));
    
    const device = devices.find(d => d.id === deviceId);
    toast({
      title: enabled ? "Sharing Enabled" : "Sharing Disabled",
      description: `${device?.name} data ${enabled ? 'will be' : 'will not be'} shared with your healthcare providers.`,
    });
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    
    // Simulate sync process
    setTimeout(() => {
      const now = new Date().toISOString();
      setDevices(prev => prev.map(d => 
        d.isConnected ? { ...d, lastSync: now } : d
      ));
      
      setIsSyncing(false);
      toast({
        title: "Sync Complete",
        description: "All connected devices have been synchronized.",
      });
    }, 3000);
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    return date.toLocaleString();
  };

  const connectedDevices = devices.filter(d => d.isConnected);
  const sharedDevices = devices.filter(d => d.isConnected && d.sharingEnabled);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Connected Devices</p>
                <p className="text-2xl font-bold text-autheo-primary">{connectedDevices.length}</p>
              </div>
              <Activity className="h-8 w-8 text-autheo-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Sharing with Providers</p>
                <p className="text-2xl font-bold text-autheo-primary">{sharedDevices.length}</p>
              </div>
              <Share2 className="h-8 w-8 text-autheo-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Data Protection</p>
                <p className="text-sm font-medium text-green-400">Full Control</p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Devices */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-autheo-primary">Fitness Device Connections</CardTitle>
            {connectedDevices.length > 0 && (
              <Button 
                onClick={handleSyncAll}
                disabled={isSyncing}
                variant="outline"
                size="sm"
                className="border-autheo-primary/30 text-autheo-primary hover:bg-autheo-primary/10"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {devices.map((device) => (
            <div key={device.id} className="p-4 border border-slate-700 rounded-lg bg-slate-800/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-slate-700">
                    {device.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-100">{device.name}</h3>
                    <p className="text-sm text-slate-400">
                      Last sync: {formatLastSync(device.lastSync)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={device.isConnected ? "default" : "outline"}
                    className={device.isConnected ? "bg-green-600 text-white" : "border-slate-600 text-slate-400"}
                  >
                    {device.isConnected ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Connected
                      </>
                    )}
                  </Badge>
                  <Button
                    onClick={() => handleDeviceConnection(device.id)}
                    variant={device.isConnected ? "destructive" : "default"}
                    size="sm"
                  >
                    {device.isConnected ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </div>
              
              {device.isConnected && (
                <div className="space-y-3 pt-3 border-t border-slate-700">
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-2">Available Data Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {device.dataTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs border-slate-600 text-slate-300">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-300">Share with Healthcare Providers</p>
                      <p className="text-xs text-slate-400">Allow your medical team to access this data</p>
                    </div>
                    <Switch
                      checked={device.sharingEnabled}
                      onCheckedChange={(checked) => handleSharingToggle(device.id, checked)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-autheo-primary mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-medium text-autheo-primary">Your Data, Your Control</h3>
              <p className="text-sm text-slate-300">
                You maintain full control over your fitness data. You can connect or disconnect devices, 
                choose what data to share with healthcare providers, and revoke access at any time. 
                Your data is encrypted and only accessible to providers you explicitly authorize.
              </p>
              <div className="flex gap-4 text-xs text-slate-400 mt-2">
                <span>• End-to-end encryption</span>
                <span>• Granular sharing controls</span>
                <span>• Instant revocation</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FitnessDeviceIntegration;
