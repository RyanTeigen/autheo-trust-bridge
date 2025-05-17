
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AccessManagementTab from '@/components/shared-records/AccessManagementTab';
import HealthRecordsTab from '@/components/shared-records/HealthRecordsTab';
import { SharedRecord, Medication, Diagnosis, Immunization, MedicalTest, Allergy } from '@/components/shared-records/types';

const SharedRecordsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('access');
  const [shareHealthDialog, setShareHealthDialog] = useState(false);
  
  // Mock data for shared records
  const [sharedRecords, setSharedRecords] = useState<SharedRecord[]>([
    {
      id: '1',
      recipientName: 'Dr. Emily Chen',
      recipientType: 'provider',
      sharedDate: '2025-03-01',
      expiryDate: '2025-06-01',
      accessLevel: 'full',
      status: 'active'
    },
    {
      id: '2',
      recipientName: 'City Hospital',
      recipientType: 'organization',
      sharedDate: '2025-02-15',
      expiryDate: '2026-02-15',
      accessLevel: 'limited',
      status: 'active'
    },
    {
      id: '3',
      recipientName: 'Sarah Johnson (Mom)',
      recipientType: 'caregiver',
      sharedDate: '2025-01-10',
      expiryDate: '2025-04-10',
      accessLevel: 'read-only',
      status: 'expired'
    }
  ]);
  
  // Mock health record data
  const mockMedications: Medication[] = [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Daily',
      startDate: '2025-04-01',
      refillDate: '2025-06-01',
      prescribedBy: 'Dr. Emily Chen'
    },
    {
      id: '2',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily at bedtime',
      startDate: '2025-03-15',
      refillDate: '2025-05-20',
      prescribedBy: 'Dr. James Wilson'
    },
    {
      id: '3',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily with meals',
      startDate: '2025-02-10',
      refillDate: '2025-05-10',
      prescribedBy: 'Dr. Emily Chen'
    }
  ];
  
  const mockDiagnoses: Diagnosis[] = [
    {
      id: '1',
      condition: 'Hypertension',
      diagnosedDate: '2024-10-15',
      diagnosedBy: 'Dr. Emily Chen',
      status: 'chronic',
      notes: 'Well-controlled with current medication'
    },
    {
      id: '2',
      condition: 'Type 2 Diabetes',
      diagnosedDate: '2024-09-05',
      diagnosedBy: 'Dr. James Wilson',
      status: 'active',
      notes: 'Currently managing with medication and lifestyle changes'
    },
    {
      id: '3',
      condition: 'Seasonal Allergies',
      diagnosedDate: '2023-04-20',
      diagnosedBy: 'Dr. Sarah Johnson',
      status: 'resolved'
    }
  ];
  
  const mockImmunizations: Immunization[] = [
    {
      id: '1',
      name: 'COVID-19 Vaccine',
      date: '2025-01-15',
      administeredBy: 'City Hospital Clinic',
      lotNumber: 'CV19-45789',
      nextDose: '2025-07-15'
    },
    {
      id: '2',
      name: 'Influenza Vaccine',
      date: '2024-10-20',
      administeredBy: 'Neighborhood Pharmacy',
      lotNumber: 'FLU-78965'
    },
    {
      id: '3',
      name: 'Tetanus Booster',
      date: '2022-06-10',
      administeredBy: 'Dr. Emily Chen',
      lotNumber: 'TET-12345',
      nextDose: '2032-06-10'
    }
  ];
  
  const mockMedicalTests: MedicalTest[] = [
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      date: '2025-04-15',
      orderedBy: 'Dr. Emily Chen',
      results: 'All values within normal range',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Lipid Panel',
      date: '2025-04-15',
      orderedBy: 'Dr. Emily Chen',
      results: 'LDL slightly elevated, other values normal',
      status: 'completed'
    },
    {
      id: '3',
      name: 'Chest X-Ray',
      date: '2025-05-10',
      orderedBy: 'Dr. James Wilson',
      status: 'pending'
    }
  ];
  
  // Mock allergies data
  const mockAllergies: Allergy[] = [
    {
      id: '1',
      name: 'Penicillin',
      severity: 'severe',
      reaction: 'Hives, difficulty breathing',
      diagnosed: '2023-05-15'
    },
    {
      id: '2',
      name: 'Peanuts',
      severity: 'moderate',
      reaction: 'Swelling, itchy throat',
      diagnosed: '2022-07-20'
    },
    {
      id: '3',
      name: 'Pollen',
      severity: 'mild',
      reaction: 'Sneezing, watery eyes',
      diagnosed: '2021-04-10'
    }
  ];
  
  const handleAddRecord = (newRecordData: Omit<SharedRecord, 'id'>) => {
    const newRecord = {
      ...newRecordData,
      id: (sharedRecords.length + 1).toString(),
    };
    
    setSharedRecords([...sharedRecords, newRecord]);
    
    toast({
      title: "Records shared successfully",
      description: `${newRecordData.recipientName} now has ${newRecordData.accessLevel} access to your records.`,
    });
  };
  
  const handleRevokeAccess = (id: string) => {
    const updatedRecords = sharedRecords.map(record => 
      record.id === id ? { ...record, status: 'expired' } : record
    );
    
    setSharedRecords(updatedRecords);
    
    toast({
      title: "Access revoked",
      description: "The recipient's access to your records has been revoked.",
    });
  };
  
  const handleShareHealthInfo = () => {
    setShareHealthDialog(false);
    
    toast({
      title: "Health information shared",
      description: "Your health information has been shared with the selected healthcare provider.",
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Shared Records</h1>
        <p className="text-muted-foreground">
          Manage your health information and sharing preferences
        </p>
      </div>
      
      {/* Top-level tab system */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="access" className="px-6">Access Management</TabsTrigger>
          <TabsTrigger value="records" className="px-6">My Health Records</TabsTrigger>
        </TabsList>
        
        {/* Access Management Tab */}
        <TabsContent value="access" className="mt-0">
          <AccessManagementTab 
            sharedRecords={sharedRecords}
            onAddRecord={handleAddRecord}
            onRevokeAccess={handleRevokeAccess}
          />
        </TabsContent>
        
        {/* Health Records Tab */}
        <TabsContent value="records" className="mt-0">
          <HealthRecordsTab 
            mockMedications={mockMedications}
            mockDiagnoses={mockDiagnoses}
            mockImmunizations={mockImmunizations}
            mockMedicalTests={mockMedicalTests}
            mockAllergies={mockAllergies}
            shareHealthDialog={shareHealthDialog}
            setShareHealthDialog={setShareHealthDialog}
            handleShareHealthInfo={handleShareHealthInfo}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedRecordsPage;
