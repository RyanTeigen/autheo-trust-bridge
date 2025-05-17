
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import AccessManagementTab from '@/components/shared-records/AccessManagementTab';
import HealthRecordsTab from '@/components/shared-records/HealthRecordsTab';
import { SharedRecord } from '@/components/shared-records/types';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface SharedRecordsContentProps {
  handleShareHealthInfo: () => void;
}

const SharedRecordsContent: React.FC<SharedRecordsContentProps> = ({
  handleShareHealthInfo
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('access');
  const [shareHealthDialog, setShareHealthDialog] = useState(false);
  
  const { 
    medications, 
    diagnoses, 
    immunizations, 
    medicalTests, 
    allergies 
  } = useHealthRecords();
  
  // Mock data for shared records with correct type enforcement
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
      record.id === id ? { ...record, status: 'expired' as const } : record
    );
    
    setSharedRecords(updatedRecords);
    
    toast({
      title: "Access revoked",
      description: "The recipient's access to your records has been revoked.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shared Records</CardTitle>
          <CardDescription>
            Manage your health information and sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800">
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
                mockMedications={medications}
                mockDiagnoses={diagnoses}
                mockImmunizations={immunizations}
                mockMedicalTests={medicalTests}
                mockAllergies={allergies}
                shareHealthDialog={shareHealthDialog}
                setShareHealthDialog={setShareHealthDialog}
                handleShareHealthInfo={handleShareHealthInfo}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedRecordsContent;
