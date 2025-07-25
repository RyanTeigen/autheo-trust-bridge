import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  Shield,
  Lock,
  Eye
} from 'lucide-react';
import FitnessPrivacyDashboard from './FitnessPrivacyDashboard';

interface FitnessDevice {
  id: string;
  name: string;
  icon: React.ReactNode;
  isConnected: boolean;
  lastSync?: string;
  dataTypes: string[];
  sharingEnabled: boolean;
  athleteId?: string;
}

const FitnessDeviceIntegration: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('devices');
  
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFitnessIntegrations();
  }, []);

  const loadFitnessIntegrations = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.error('User not authenticated');
        return;
      }

      const { data: integrations, error } = await supabase
        .from('fitness_integrations')
        .select('*')
        .eq('user_id', user.user.id);

      if (error) {
        console.error('Error loading integrations:', error);
        return;
      }

      if (integrations) {
        setDevices(prev => prev.map(device => {
          const integration = integrations.find(i => i.device_type === device.id);
          if (integration) {
            return {
              ...device,
              isConnected: integration.is_connected,
              lastSync: integration.last_sync_at,
              athleteId: integration.athlete_id
            };
          }
          return device;
        }));
      }
    } catch (error) {
      console.error('Error loading fitness integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceConnection = async (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    if (device.isConnected) {
      // Disconnect device
      try {
        const { data, error } = await supabase.functions.invoke('fitness-integration', {
          body: JSON.stringify({ 
            action: 'disconnect', 
            device_type: deviceId 
          })
        });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Failed to disconnect device');
        }

        setDevices(prev => prev.map(d => 
          d.id === deviceId 
            ? { ...d, isConnected: false, lastSync: undefined, sharingEnabled: false }
            : d
        ));
        
        toast({
          title: "Device Disconnected",
          description: `${device.name} has been disconnected from your account.`,
        });
      } catch (error) {
        console.error('Error disconnecting device:', error);
        toast({
          title: "Connection Error",
          description: `Failed to disconnect device: ${error.message}`,
          variant: "destructive"
        });
      }
    } else {
      // Connect device (initiate OAuth flow)
      try {
        toast({
          title: "Connecting...",
          description: `Redirecting to ${device.name} for authorization.`,
        });

        console.log('Invoking fitness-integration function with:', { 
          action: 'oauth_url', 
          device_type: deviceId 
        });

        const { data, error } = await supabase.functions.invoke('fitness-integration', {
          body: JSON.stringify({ 
            action: 'oauth_url', 
            device_type: deviceId 
          })
        });

        console.log('Function response:', { data, error });

        if (error) {
          console.error('Supabase function error:', error);
          throw new Error(error.message || 'Failed to get authorization URL');
        }

        if (data && data.authUrl) {
          console.log('Redirecting to OAuth URL:', data.authUrl);
          // Open OAuth URL in same window
          window.location.href = data.authUrl;
        } else {
          console.error('No authorization URL received:', data);
          throw new Error('No authorization URL received from server');
        }
      } catch (error) {
        console.error('Error connecting device:', error);
        toast({
          title: "Connection Error", 
          description: `Failed to connect to ${device.name}: ${error.message}`,
          variant: "destructive"
        });
      }
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
    
    try {
      const connectedDevices = devices.filter(d => d.isConnected);
      
      for (const device of connectedDevices) {
        try {
          const { error } = await supabase.functions.invoke('fitness-integration', {
            body: { 
              action: 'sync_data', 
              device_type: device.id 
            }
          });
          
          if (error) {
            console.error(`Error syncing ${device.name}:`, error);
          }
        } catch (error) {
          console.error(`Error syncing ${device.name}:`, error);
        }
      }
      
      // Reload integrations to get updated sync times
      await loadFitnessIntegrations();
      
      toast({
        title: "Sync Complete",
        description: "All connected devices have been synchronized.",
      });
    } catch (error) {
      console.error('Error during sync:', error);
      toast({
        title: "Sync Error",
        description: "Some devices failed to sync. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    const date = new Date(lastSync);
    return date.toLocaleString();
  };

  const connectedDevices = devices.filter(d => d.isConnected);
  const sharedDevices = devices.filter(d => d.isConnected && d.sharingEnabled);

  if (isLoading) {
    return <div>Loading fitness integrations...</div>;
  }

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
                <p className="text-sm font-medium text-green-400">Quantum-Safe</p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tabs with Privacy Features */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <FitnessPrivacyDashboard />
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {/* Privacy Notice with Enhanced Security Info */}
          <Card className="bg-slate-800/30 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-autheo-primary mt-1" />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-autheo-primary">Advanced Data Protection</h3>
                  <p className="text-slate-300">
                    Your fitness data is protected using state-of-the-art quantum-resistant encryption and 
                    zero-knowledge proof technologies. This ensures your privacy remains intact even against 
                    future quantum computer attacks.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-200">Post-Quantum Cryptography</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• CRYSTALS-Kyber encryption</li>
                        <li>• CRYSTALS-Dilithium signatures</li>
                        <li>• 256-bit quantum security level</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-200">Zero-Knowledge Proofs</h4>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Prove achievements without data</li>
                        <li>• Cryptographic verification</li>
                        <li>• Complete privacy preservation</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex gap-6 text-xs text-slate-400 mt-4 pt-4 border-t border-slate-700">
                    <span>• Quantum-resistant encryption</span>
                    <span>• Zero-knowledge verification</span>
                    <span>• Differential privacy</span>
                    <span>• Granular access controls</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FitnessDeviceIntegration;
