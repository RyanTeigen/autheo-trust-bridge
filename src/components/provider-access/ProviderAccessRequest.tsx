
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import PatientSearch, { PatientInfo } from './request/PatientSearch';
import PatientInfoDisplay from './request/PatientInfoDisplay';
import AccessRequestForm from './request/AccessRequestForm';

const ProviderAccessRequest: React.FC = () => {
  const [patientId, setPatientId] = useState('');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  
  const handleRequestComplete = () => {
    // Reset form
    setPatientId('');
    setPatientInfo(null);
  };

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Request Patient Access</CardTitle>
        <CardDescription className="text-slate-300">
          Request permission to view a patient's health records
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-4">
          {!patientInfo ? (
            <PatientSearch 
              patientId={patientId}
              setPatientId={setPatientId}
              setPatientInfo={setPatientInfo}
            />
          ) : (
            <>
              <PatientInfoDisplay patientInfo={patientInfo} />
              <AccessRequestForm 
                patientInfo={patientInfo}
                onRequestComplete={handleRequestComplete}
              />
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-slate-700/30 border-t border-slate-700 px-6 py-4 text-xs text-slate-400">
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-1.5 text-autheo-primary" /> 
          All access requests are cryptographically signed and recorded on the blockchain
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProviderAccessRequest;
