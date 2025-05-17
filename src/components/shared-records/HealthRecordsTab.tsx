
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share } from 'lucide-react';
import DetailedHealthRecords from '@/components/records/DetailedHealthRecords';
import ShareHealthInfoDialog from './ShareHealthInfoDialog';

interface HealthRecordsTabProps {
  mockMedications: any[];
  mockDiagnoses: any[];
  mockImmunizations: any[];
  mockMedicalTests: any[];
  mockAllergies: any[];
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
    <>
      <ShareHealthInfoDialog 
        open={shareHealthDialog} 
        onOpenChange={setShareHealthDialog}
        onShare={handleShareHealthInfo}
      />
      
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => setShareHealthDialog(true)} 
          className="gap-1"
        >
          <Share className="h-4 w-4" />
          Share Health Information
        </Button>
      </div>
      
      <DetailedHealthRecords
        medications={mockMedications}
        diagnoses={mockDiagnoses}
        immunizations={mockImmunizations}
        medicalTests={mockMedicalTests}
        allergies={mockAllergies}
      />
    </>
  );
};

export default HealthRecordsTab;
