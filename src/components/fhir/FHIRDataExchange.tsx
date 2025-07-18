import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Database,
  RefreshCw
} from 'lucide-react';
import FHIRService from '@/services/fhir/FHIRService';
import { FHIRPatient, FHIRObservation, FHIRBundle } from '@/types/fhir';

const FHIRDataExchange: React.FC = () => {
  const { toast } = useToast();
  const [fhirService] = useState(() => new FHIRService());
  const [selectedPatient, setSelectedPatient] = useState<FHIRPatient | null>(null);
  const [fhirData, setFhirData] = useState('');
  const [validationResult, setValidationResult] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  // Sample FHIR endpoints for testing
  const [fhirEndpoint, setFhirEndpoint] = useState('https://hapi.fhir.org/baseR4');
  const [apiKey, setApiKey] = useState('');

  const handleExportPatientData = async () => {
    if (!selectedPatient?.id) {
      toast({
        title: "No Patient Selected",
        description: "Please select a patient to export their data",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setExportProgress(0);

    try {
      // Simulate progress for demo
      setExportProgress(25);
      
      // Get patient data
      const patient = await fhirService.getPatient(selectedPatient.id);
      setExportProgress(50);
      
      // Get patient observations
      const observations = await fhirService.getPatientObservations(selectedPatient.id);
      setExportProgress(75);
      
      // Create FHIR bundle
      const bundle: FHIRBundle = {
        resourceType: 'Bundle',
        type: 'collection',
        timestamp: new Date().toISOString(),
        entry: [
          {
            resource: patient,
            fullUrl: `Patient/${patient.id}`,
          },
          ...observations.map(obs => ({
            resource: obs,
            fullUrl: `Observation/${obs.id}`,
          })),
        ],
      };
      
      setExportProgress(100);
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { 
        type: 'application/fhir+json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-${patient.id}-fhir-export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `FHIR bundle exported for patient ${patient.name?.[0]?.given?.[0]} ${patient.name?.[0]?.family}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export patient data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setExportProgress(0);
    }
  };

  const handleImportFHIRData = async () => {
    if (!fhirData.trim()) {
      toast({
        title: "No Data to Import",
        description: "Please paste FHIR JSON data to import",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const resource = JSON.parse(fhirData);
      
      // Validate FHIR resource
      const validation = fhirService.validateFHIRResource(resource);
      setValidationResult(validation);
      
      if (!validation.valid) {
        toast({
          title: "Validation Failed",
          description: `FHIR resource contains ${validation.errors.length} error(s)`,
          variant: "destructive",
        });
        return;
      }

      // Import the resource
      if (resource.resourceType === 'Bundle') {
        // Process bundle
        await fhirService.createBundle(resource);
        toast({
          title: "Bundle Imported",
          description: `Successfully imported FHIR bundle with ${resource.entry?.length || 0} entries`,
        });
      } else {
        // Create individual resource
        await fhirService.create(resource);
        toast({
          title: "Resource Imported",
          description: `Successfully imported ${resource.resourceType}`,
        });
      }
      
      setFhirData('');
      setValidationResult(null);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import FHIR data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateFHIRData = () => {
    try {
      const resource = JSON.parse(fhirData);
      const validation = fhirService.validateFHIRResource(resource);
      setValidationResult(validation);
      
      toast({
        title: validation.valid ? "Validation Passed" : "Validation Failed",
        description: validation.valid 
          ? "FHIR resource is valid" 
          : `Found ${validation.errors.length} validation error(s)`,
        variant: validation.valid ? "default" : "destructive",
      });
    } catch (error) {
      setValidationResult({ valid: false, errors: ['Invalid JSON format'] });
      toast({
        title: "Validation Failed",
        description: "Invalid JSON format",
        variant: "destructive",
      });
    }
  };

  const generateSamplePatient = () => {
    const samplePatient = fhirService.convertToFHIRPatient({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      birthDate: '1985-03-15',
      gender: 'male',
      address: {
        line1: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'US',
      },
      mrn: 'MRN123456',
    });

    setFhirData(JSON.stringify(samplePatient, null, 2));
  };

  const generateSampleObservation = () => {
    const sampleObservation = fhirService.convertToFHIRObservation({
      patientId: 'patient-123',
      code: '8310-5',
      display: 'Body temperature',
      value: 98.6,
      unit: 'degF',
      category: 'vital-signs',
      effectiveDateTime: new Date().toISOString(),
    });

    setFhirData(JSON.stringify(sampleObservation, null, 2));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            FHIR Data Exchange
          </CardTitle>
          <CardDescription>
            Import and export healthcare data using FHIR R4 standards for interoperability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="export" className="space-y-4">
            <TabsList>
              <TabsTrigger value="export">Export Data</TabsTrigger>
              <TabsTrigger value="import">Import Data</TabsTrigger>
              <TabsTrigger value="validate">Validate FHIR</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Export</CardTitle>
                    <CardDescription>
                      Export patient data as FHIR bundle
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="patient-select">Select Patient</Label>
                      <Select onValueChange={(value) => {
                        // In real implementation, fetch patient data
                        setSelectedPatient({ 
                          resourceType: 'Patient', 
                          id: value,
                          name: [{ given: ['John'], family: 'Doe' }]
                        });
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="patient-1">John Doe (MRN: 12345)</SelectItem>
                          <SelectItem value="patient-2">Jane Smith (MRN: 67890)</SelectItem>
                          <SelectItem value="patient-3">Bob Johnson (MRN: 13579)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {exportProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Exporting...</span>
                          <span>{exportProgress}%</span>
                        </div>
                        <Progress value={exportProgress} />
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleExportPatientData}
                      disabled={!selectedPatient || isLoading}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export FHIR Bundle
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Export Options</CardTitle>
                    <CardDescription>
                      Configure what data to include
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="include-observations" defaultChecked />
                        <Label htmlFor="include-observations">Observations</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="include-medications" defaultChecked />
                        <Label htmlFor="include-medications">Medications</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="include-allergies" defaultChecked />
                        <Label htmlFor="include-allergies">Allergies</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="include-conditions" defaultChecked />
                        <Label htmlFor="include-conditions">Conditions</Label>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="date-range">Date Range</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All data" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All data</SelectItem>
                          <SelectItem value="last-year">Last year</SelectItem>
                          <SelectItem value="last-month">Last month</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Import FHIR Data</CardTitle>
                  <CardDescription>
                    Paste FHIR JSON data to import into the system
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={generateSamplePatient}>
                      <FileText className="h-4 w-4 mr-2" />
                      Sample Patient
                    </Button>
                    <Button variant="outline" onClick={generateSampleObservation}>
                      <FileText className="h-4 w-4 mr-2" />
                      Sample Observation
                    </Button>
                  </div>
                  
                  <div>
                    <Label htmlFor="fhir-data">FHIR JSON Data</Label>
                    <Textarea
                      id="fhir-data"
                      placeholder="Paste FHIR JSON data here..."
                      value={fhirData}
                      onChange={(e) => setFhirData(e.target.value)}
                      className="min-h-[300px] font-mono text-sm"
                    />
                  </div>
                  
                  {validationResult && (
                    <div className={`p-3 rounded-lg border ${
                      validationResult.valid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {validationResult.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">
                          {validationResult.valid ? 'Valid FHIR Resource' : 'Validation Errors'}
                        </span>
                      </div>
                      {!validationResult.valid && (
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                          {validationResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={validateFHIRData}
                      disabled={!fhirData.trim()}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Validate
                    </Button>
                    <Button 
                      onClick={handleImportFHIRData}
                      disabled={!fhirData.trim() || isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="validate" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">FHIR Validation</CardTitle>
                  <CardDescription>
                    Validate FHIR resources against R4 specification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Patients</p>
                          <p className="text-2xl font-bold">24</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Observations</p>
                          <p className="text-2xl font-bold">156</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-yellow-500" />
                      </div>
                    </Card>
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Validation Errors</p>
                          <p className="text-2xl font-bold">3</p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-500" />
                      </div>
                    </Card>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Full Validation
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">FHIR Server Configuration</CardTitle>
                  <CardDescription>
                    Configure FHIR server endpoints and authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fhir-endpoint">FHIR Server Endpoint</Label>
                    <Input
                      id="fhir-endpoint"
                      value={fhirEndpoint}
                      onChange={(e) => setFhirEndpoint(e.target.value)}
                      placeholder="https://hapi.fhir.org/baseR4"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="api-key">API Key (Optional)</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter API key if required"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">FHIR R4</Badge>
                    <Badge variant="secondary">HL7 Compatible</Badge>
                    <Badge variant="secondary">Validation Enabled</Badge>
                  </div>
                  
                  <Button>
                    Save Configuration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FHIRDataExchange;