
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Health Information</h2>
        
        <ShareHealthInfoDialog 
          open={shareHealthDialog} 
          onOpenChange={setShareHealthDialog}
          onSubmit={handleShareHealthInfo}
        />
        
        <Button onClick={() => setShareHealthDialog(true)} className="bg-autheo-primary hover:bg-autheo-primary/90">
          <Share className="h-4 w-4 mr-1" />
          Share Health Info
        </Button>
      </div>
      
      <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle>Health Records</CardTitle>
        </CardHeader>
        <CardContent>
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
