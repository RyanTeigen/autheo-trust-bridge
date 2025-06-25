
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Search, UserPlus, Database, Shield, Eye } from 'lucide-react';
import SharedRecordsViewer from '../provider/SharedRecordsViewer';
import AdvancedPatientSearch from '../emr/AdvancedPatientSearch';
import AccessRequestForm from './AccessRequestForm';
import { PatientRecord } from '../emr/AdvancedPatientSearch';

// Mock patient data for search functionality
const mockPatients: PatientRecord[] = [
  { id: "P12345", name: "John Doe", dob: "1980-05-15", mrn: "MR-123456", lastVisit: "2025-05-10", insuranceProvider: "BlueCross", primaryCareProvider: "Dr. Smith", tags: ["Chronic Condition"] },
  { id: "P23456", name: "Jane Smith", dob: "1975-08-22", mrn: "MR-234567", lastVisit: "2025-05-08", insuranceProvider: "Aetna", primaryCareProvider: "Dr. Johnson", tags: ["New Patient"] },
  { id: "P34567", name: "Robert Johnson", dob: "1990-11-10", mrn: "MR-345678", lastVisit: "2025-05-05", insuranceProvider: "UnitedHealth", primaryCareProvider: "Dr. Williams", tags: ["Follow-up Required"] },
  { id: "P45678", name: "Emily Wilson", dob: "1985-03-30", mrn: "MR-456789", lastVisit: "2025-05-01", insuranceProvider: "Medicare", primaryCareProvider: "Dr. Davis", tags: ["High Risk"] },
  { id: "P56789", name: "Michael Brown", dob: "1968-07-17", mrn: "MR-567890", lastVisit: "2025-04-28", insuranceProvider: "Cigna", primaryCareProvider: "Dr. Brown", tags: ["Specialist Referral"] },
];

const ConsolidatedPatientRecordsTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('shared-records');
  const [searchResults, setSearchResults] = useState<PatientRecord[]>([]);

  const handleSearchResults = (results: PatientRecord[]) => {
    setSearchResults(results);
    console.log('Search results:', results);
  };

  const handleRequestAccess = (patientId: string) => {
    console.log('Requesting access for patient:', patientId);
    // This would typically trigger the access request workflow
  };

  return (
    <div className="space-y-6 bg-slate-900 text-slate-100">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Database className="h-6 w-6 text-autheo-primary" />
              Patient Records Management
            </h2>
            <p className="text-slate-400 mt-1">
              Access shared records, search for patients, and request additional access
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-autheo-primary/30 text-autheo-primary">
              <Shield className="h-3 w-3 mr-1" />
              HIPAA Compliant
            </Badge>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300">
              Provider Portal
            </Badge>
          </div>
        </div>

        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
            <TabsTrigger 
              value="shared-records" 
              className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Shared Records
              <Badge variant="secondary" className="ml-1 bg-autheo-primary/20 text-autheo-primary">
                Primary
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="search-patients" 
              className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search Patients
            </TabsTrigger>
            <TabsTrigger 
              value="request-access" 
              className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900 flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Request Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shared-records" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-autheo-primary flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Records Shared With You
                </CardTitle>
                <CardDescription className="text-slate-400">
                  View and access medical records that patients have shared with you through quantum-safe encryption
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SharedRecordsViewer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search-patients" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-autheo-primary flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Patient Search
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Search for patients in your network and view their available records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdvancedPatientSearch 
                    patients={mockPatients}
                    onSearch={handleSearchResults}
                  />
                </CardContent>
              </Card>

              {searchResults.length > 0 && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-300">Search Results ({searchResults.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {searchResults.map((patient) => (
                        <div key={patient.id} className="p-4 border border-slate-600 rounded-lg hover:border-slate-500 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h4 className="font-medium text-slate-100">{patient.name}</h4>
                                <Badge variant="outline" className="border-slate-600 text-slate-300">
                                  {patient.mrn}
                                </Badge>
                              </div>
                              <div className="text-sm text-slate-400 grid grid-cols-2 gap-4">
                                <span>DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                                <span>Last Visit: {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}</span>
                                <span>Insurance: {patient.insuranceProvider || 'N/A'}</span>
                                <span>Primary Care: {patient.primaryCareProvider || 'N/A'}</span>
                              </div>
                              {patient.tags && patient.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {patient.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRequestAccess(patient.id)}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              <UserPlus className="h-3 w-3 mr-1" />
                              Request Access
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="request-access" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-autheo-primary flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Request Patient Access
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Submit a formal request to access additional patient records or specific information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessRequestForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConsolidatedPatientRecordsTab;
