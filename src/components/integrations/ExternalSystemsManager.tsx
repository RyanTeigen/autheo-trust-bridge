import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  Hospital,
  FlaskConical,
  Pill,
  Zap,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { ExternalSystem, DataMapping, FieldMapping } from '@/types/fhir';

const ExternalSystemsManager: React.FC = () => {
  const { toast } = useToast();
  const [systems, setSystems] = useState<ExternalSystem[]>([
    {
      id: 'epic-main',
      name: 'Epic EMR - Main Hospital',
      type: 'hospital',
      endpoint: 'https://api.epic.com/fhir/r4',
      status: 'active',
      authentication: {
        type: 'oauth2',
        credentials: { client_id: 'xxx', client_secret: 'xxx' }
      },
      capabilities: ['Patient', 'Observation', 'Medication'],
      lastSync: '2024-01-15T10:30:00Z',
      configuration: {
        syncInterval: 300,
        retryAttempts: 3,
        timeout: 30000
      }
    },
    {
      id: 'lab-corp',
      name: 'LabCorp Integration',
      type: 'lab',
      endpoint: 'https://api.labcorp.com/v1',
      status: 'active',
      authentication: {
        type: 'apikey',
        credentials: { api_key: 'xxx' }
      },
      capabilities: ['Lab Results', 'Diagnostic Reports'],
      lastSync: '2024-01-15T09:45:00Z',
      configuration: {
        syncInterval: 600,
        retryAttempts: 2,
        timeout: 45000
      }
    },
    {
      id: 'cvs-pharmacy',
      name: 'CVS Pharmacy Network',
      type: 'pharmacy',
      endpoint: 'https://api.cvs.com/pharmacy/v2',
      status: 'inactive',
      authentication: {
        type: 'certificate',
        credentials: { cert_file: 'cvs-cert.pem' }
      },
      capabilities: ['Prescriptions', 'Medication Inventory'],
      configuration: {
        syncInterval: 900,
        retryAttempts: 3,
        timeout: 60000
      }
    }
  ]);

  const [newSystem, setNewSystem] = useState<Partial<ExternalSystem>>({
    name: '',
    type: 'hospital',
    endpoint: '',
    status: 'inactive',
    authentication: { type: 'oauth2' },
    capabilities: [],
    configuration: {}
  });

  const [selectedSystem, setSelectedSystem] = useState<ExternalSystem | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<Record<string, number>>({});

  const handleAddSystem = () => {
    if (!newSystem.name || !newSystem.endpoint) {
      toast({
        title: "Missing Information",
        description: "Please provide system name and endpoint",
        variant: "destructive",
      });
      return;
    }

    const system: ExternalSystem = {
      id: `system-${Date.now()}`,
      name: newSystem.name,
      type: newSystem.type as any,
      endpoint: newSystem.endpoint,
      status: 'inactive',
      authentication: newSystem.authentication!,
      capabilities: [],
      configuration: {
        syncInterval: 300,
        retryAttempts: 3,
        timeout: 30000,
        ...newSystem.configuration
      }
    };

    setSystems(prev => [...prev, system]);
    setNewSystem({
      name: '',
      type: 'hospital',
      endpoint: '',
      status: 'inactive',
      authentication: { type: 'oauth2' },
      capabilities: [],
      configuration: {}
    });

    toast({
      title: "System Added",
      description: `${system.name} has been added successfully`,
    });
  };

  const handleTestConnection = async (systemId: string) => {
    setIsConnecting(systemId);
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSystems(prev => prev.map(sys => 
        sys.id === systemId 
          ? { ...sys, status: 'active' as const }
          : sys
      ));

      toast({
        title: "Connection Successful",
        description: "System connection test passed",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the external system",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleSyncData = async (systemId: string) => {
    setSyncProgress(prev => ({ ...prev, [systemId]: 0 }));
    
    try {
      // Simulate data sync with progress
      for (let i = 0; i <= 100; i += 10) {
        setSyncProgress(prev => ({ ...prev, [systemId]: i }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setSystems(prev => prev.map(sys => 
        sys.id === systemId 
          ? { ...sys, lastSync: new Date().toISOString() }
          : sys
      ));

      toast({
        title: "Sync Complete",
        description: "Data synchronization completed successfully",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Data synchronization encountered an error",
        variant: "destructive",
      });
    } finally {
      setSyncProgress(prev => ({ ...prev, [systemId]: 0 }));
    }
  };

  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'hospital': return <Hospital className="h-5 w-5" />;
      case 'lab': return <FlaskConical className="h-5 w-5" />;
      case 'pharmacy': return <Pill className="h-5 w-5" />;
      case 'imaging': return <Eye className="h-5 w-5" />;
      default: return <Database className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-400';
      case 'testing': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            External Systems Integration
          </CardTitle>
          <CardDescription>
            Manage connections to hospitals, labs, pharmacies, and other healthcare systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="systems" className="space-y-4">
            <TabsList>
              <TabsTrigger value="systems">Systems</TabsTrigger>
              <TabsTrigger value="add-system">Add System</TabsTrigger>
              <TabsTrigger value="mappings">Data Mappings</TabsTrigger>
              <TabsTrigger value="logs">Sync Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="systems" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {systems.map((system) => (
                  <Card key={system.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getSystemIcon(system.type)}
                          <div>
                            <CardTitle className="text-lg">{system.name}</CardTitle>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {system.type}
                            </Badge>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-600">
                        <p><strong>Endpoint:</strong> {system.endpoint}</p>
                        <p><strong>Auth:</strong> {system.authentication.type}</p>
                        {system.lastSync && (
                          <p><strong>Last Sync:</strong> {new Date(system.lastSync).toLocaleString()}</p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {system.capabilities.map((cap, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>

                      {syncProgress[system.id] > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Syncing...</span>
                            <span>{syncProgress[system.id]}%</span>
                          </div>
                          <Progress value={syncProgress[system.id]} className="h-2" />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestConnection(system.id)}
                          disabled={isConnecting === system.id}
                        >
                          {isConnecting === system.id ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          Test
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSyncData(system.id)}
                          disabled={system.status !== 'active' || syncProgress[system.id] > 0}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="add-system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add New External System</CardTitle>
                  <CardDescription>
                    Configure a new integration with an external healthcare system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="system-name">System Name</Label>
                      <Input
                        id="system-name"
                        value={newSystem.name}
                        onChange={(e) => setNewSystem(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Epic EMR - Downtown"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="system-type">System Type</Label>
                      <Select 
                        value={newSystem.type} 
                        onValueChange={(value) => setNewSystem(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select system type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hospital">Hospital/EMR</SelectItem>
                          <SelectItem value="lab">Laboratory</SelectItem>
                          <SelectItem value="pharmacy">Pharmacy</SelectItem>
                          <SelectItem value="imaging">Imaging Center</SelectItem>
                          <SelectItem value="ehr">Electronic Health Record</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="endpoint">API Endpoint</Label>
                      <Input
                        id="endpoint"
                        value={newSystem.endpoint}
                        onChange={(e) => setNewSystem(prev => ({ ...prev, endpoint: e.target.value }))}
                        placeholder="https://api.example.com/fhir/r4"
                      />
                    </div>

                    <div>
                      <Label htmlFor="auth-type">Authentication Type</Label>
                      <Select 
                        value={newSystem.authentication?.type} 
                        onValueChange={(value) => setNewSystem(prev => ({ 
                          ...prev, 
                          authentication: { ...prev.authentication, type: value as any }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select auth type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                          <SelectItem value="apikey">API Key</SelectItem>
                          <SelectItem value="basic">Basic Auth</SelectItem>
                          <SelectItem value="certificate">Certificate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newSystem.authentication?.type === 'oauth2' && (
                      <>
                        <div>
                          <Label htmlFor="client-id">Client ID</Label>
                          <Input
                            id="client-id"
                            placeholder="OAuth client ID"
                          />
                        </div>
                        <div>
                          <Label htmlFor="client-secret">Client Secret</Label>
                          <Input
                            id="client-secret"
                            type="password"
                            placeholder="OAuth client secret"
                          />
                        </div>
                      </>
                    )}

                    {newSystem.authentication?.type === 'apikey' && (
                      <div>
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                          id="api-key"
                          type="password"
                          placeholder="API key"
                        />
                      </div>
                    )}
                  </div>

                  <Button onClick={handleAddSystem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add System
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mappings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Data Mapping Configuration</CardTitle>
                  <CardDescription>
                    Configure how data is mapped between systems
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Source System</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            {systems.map(sys => (
                              <SelectItem key={sys.id} value={sys.id}>
                                {sys.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Target System</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="internal">Internal System</SelectItem>
                            {systems.map(sys => (
                              <SelectItem key={sys.id} value={sys.id}>
                                {sys.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Resource Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Patient">Patient</SelectItem>
                            <SelectItem value="Observation">Observation</SelectItem>
                            <SelectItem value="Medication">Medication</SelectItem>
                            <SelectItem value="DiagnosticReport">Lab Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">Field Mappings</h4>
                      <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-600">
                          <span>Source Field</span>
                          <span>Target Field</span>
                          <span>Transformation</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <Input placeholder="patient.name" />
                          <Input placeholder="name.family" />
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="format">Format</SelectItem>
                              <SelectItem value="lookup">Lookup</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="mt-3">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Mapping
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Synchronization Logs</CardTitle>
                  <CardDescription>
                    View recent data synchronization activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { time: '2024-01-15 10:30:00', system: 'Epic EMR', action: 'Patient Sync', status: 'success', records: 25 },
                      { time: '2024-01-15 10:25:00', system: 'LabCorp', action: 'Lab Results Import', status: 'success', records: 12 },
                      { time: '2024-01-15 10:20:00', system: 'CVS Pharmacy', action: 'Prescription Sync', status: 'error', records: 0 },
                      { time: '2024-01-15 10:15:00', system: 'Epic EMR', action: 'Observation Export', status: 'success', records: 8 }
                    ].map((log, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {log.status === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{log.action}</p>
                            <p className="text-sm text-gray-600">{log.system}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{log.records} records</p>
                          <p className="text-xs text-gray-500">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalSystemsManager;