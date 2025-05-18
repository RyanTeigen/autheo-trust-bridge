
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Share } from 'lucide-react';
import DetailedHealthRecords from '@/components/records/DetailedHealthRecords';
import ShareHealthInfoDialog from './ShareHealthInfoDialog';
import { Medication, Diagnosis, Immunization, MedicalTest, Allergy } from './types';

interface HealthRecordsTabProps {
  mockMedications: Medication[];
  mockDiagnoses: Diagnosis[];
  mockImmunizations: Immunization[];
  mockMedicalTests: MedicalTest[];
  mockAllergies: Allergy[];
  shareHealthDialog: boolean;
  setShareHealthDialog: (open: boolean) => void;
  handleShareHealthInfo: () => void;
}

const HealthRecordsTab: React.FC<HealthRecordsTabProps> = ({
  mockMedications,
  mockDiagnoses,
  mockImmunizations,
  mockMedicalTests,
  mockAllergies,
  shareHealthDialog,
  setShareHealthDialog,
  handleShareHealthInfo
}) => {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-autheo-primary">My Health Information</CardTitle>
              <CardDescription className="text-slate-300">
                View and manage your comprehensive health records
              </CardDescription>
            </div>
            
            <ShareHealthInfoDialog 
              open={shareHealthDialog} 
              onOpenChange={setShareHealthDialog}
              onSubmit={handleShareHealthInfo}
            />
            
            <Button 
              onClick={() => setShareHealthDialog(true)} 
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              <Share className="h-4 w-4 mr-1" />
              Share Health Info
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <DetailedHealthRecords 
            medications={mockMedications}
            diagnoses={mockDiagnoses}
            immunizations={mockImmunizations}
            medicalTests={mockMedicalTests}
            allergies={mockAllergies}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthRecordsTab;
