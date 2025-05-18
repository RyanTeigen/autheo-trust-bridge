
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AdvancedPatientSearch, { PatientRecord } from '@/components/emr/AdvancedPatientSearch';
import { Database, Shield } from 'lucide-react';

interface PatientsTabProps {
  patientRecords: PatientRecord[];
}

const PatientsTab: React.FC<PatientsTabProps> = ({ patientRecords }) => {
  const { toast } = useToast();
  const [patientSearchResults, setPatientSearchResults] = useState<PatientRecord[]>(patientRecords);

  const handleSelectPatient = (patientId: string) => {
    toast({
      title: "Patient Selected",
      description: `Navigating to patient record: ${patientId}`,
    });
  };

  const handleSearchResults = (results: PatientRecord[]) => {
    setPatientSearchResults(results);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-autheo-primary">Patient Records</CardTitle>
            <CardDescription className="text-slate-300">
              Search and access comprehensive patient health records
            </CardDescription>
          </div>
          <div className="flex items-center px-3 py-1 rounded-full bg-autheo-primary/20 text-autheo-primary text-xs">
            <Database className="h-3.5 w-3.5 mr-1" /> Electronic Health Records
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6">
          <AdvancedPatientSearch 
            patients={patientRecords}
            onSearch={handleSearchResults}
          />
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-slate-200 mb-4">Search Results</h3>
            {patientSearchResults.length > 0 ? (
              <div className="space-y-2">
                {patientSearchResults.map((patient) => (
                  <div 
                    key={patient.id} 
                    className="p-3 rounded-md bg-slate-700/30 border border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                    onClick={() => handleSelectPatient(patient.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-slate-200">{patient.name}</h4>
                        <p className="text-sm text-slate-400">DOB: {patient.dob} | MRN: {patient.mrn}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-autheo-primary">{patient.primaryCareProvider}</span>
                        <span className="text-xs text-slate-400">Last visit: {patient.lastVisit}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex gap-2">
                      {patient.tags?.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs bg-slate-800/70">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                No patient records match your search criteria
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-4 py-2 text-xs text-slate-400">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-1.5 text-autheo-primary" />
          All record accesses are verified and logged for compliance
        </div>
      </CardFooter>
    </Card>
  );
};

export default PatientsTab;
