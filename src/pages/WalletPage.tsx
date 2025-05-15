
import React, { useState } from 'react';
import { Info, PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import HealthRecordCard, { HealthRecordCardProps } from '@/components/ui/HealthRecordCard';
import { useToast } from '@/hooks/use-toast';

const WalletPage = () => {
  const { toast } = useToast();
  
  // Mock data for demo
  const [healthRecords, setHealthRecords] = useState<Omit<HealthRecordCardProps, 'onToggleShare'>[]>([
    {
      id: '1',
      title: 'Hypertension Diagnosis',
      date: '2024-01-15',
      provider: 'Dr. Emily Chen',
      category: 'condition',
      details: 'Essential (primary) hypertension. Blood pressure reading: 145/92.',
      isShared: false
    },
    {
      id: '2',
      title: 'Complete Blood Count',
      date: '2023-11-02',
      provider: 'Aurora Advocate Lab',
      category: 'lab',
      details: 'WBC: 6.2, RBC: 4.8, Hemoglobin: 14.2, Hematocrit: 42.1%, Platelets: 250',
      isShared: true
    },
    {
      id: '3',
      title: 'Chest X-Ray',
      date: '2023-09-18',
      provider: 'Radiology Partners',
      category: 'imaging',
      details: 'No acute cardiopulmonary process. Heart size and pulmonary vascularity are within normal limits.',
      isShared: false
    },
    {
      id: '4',
      title: 'Lisinopril 10mg',
      date: '2024-01-15',
      provider: 'Dr. Emily Chen',
      category: 'medication',
      details: 'Take 1 tablet by mouth once daily. For hypertension management.',
      isShared: true
    },
    {
      id: '5',
      title: 'Annual Physical Exam',
      date: '2023-08-22',
      provider: 'Dr. James Wilson',
      category: 'visit',
      details: 'Routine annual physical examination. All vitals within normal range. Discussed preventive care.',
      isShared: false
    },
    {
      id: '6',
      title: 'Progress Note',
      date: '2024-02-10',
      provider: 'Dr. Emily Chen',
      category: 'note',
      details: 'Follow-up for hypertension. Patient reports good medication compliance. Blood pressure improved to 132/85.',
      isShared: false
    }
  ]);

  const handleToggleShare = (id: string, shared: boolean) => {
    setHealthRecords(records => 
      records.map(record => 
        record.id === id ? { ...record, isShared: shared } : record
      )
    );
    
    toast({
      title: shared ? "Record shared" : "Record unshared",
      description: `The selected health record has been ${shared ? 'added to' : 'removed from'} your shared data.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Smart Wallet</h1>
        <p className="text-muted-foreground">
          Control and manage access to your health records
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Smart Wallet Active</AlertTitle>
        <AlertDescription>
          Your Smart Wallet is secured with quantum-resistant encryption. You control who sees your data and when.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Your Health Records</CardTitle>
          <CardDescription>
            Manage your complete medical history and control sharing preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
              <TabsTrigger value="private">Private</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthRecords.map(record => (
                  <HealthRecordCard
                    key={record.id}
                    {...record}
                    onToggleShare={handleToggleShare}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="shared" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthRecords
                  .filter(record => record.isShared)
                  .map(record => (
                    <HealthRecordCard
                      key={record.id}
                      {...record}
                      onToggleShare={handleToggleShare}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="private" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthRecords
                  .filter(record => !record.isShared)
                  .map(record => (
                    <HealthRecordCard
                      key={record.id}
                      {...record}
                      onToggleShare={handleToggleShare}
                    />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recent" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthRecords
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 3)
                  .map(record => (
                    <HealthRecordCard
                      key={record.id}
                      {...record}
                      onToggleShare={handleToggleShare}
                    />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Health Data Vault</CardTitle>
          <CardDescription>
            Import new health records from providers or upload documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button className="w-full flex items-center justify-center gap-2" onClick={() => 
              toast({
                title: "Feature in Development",
                description: "The ability to import records will be available soon.",
              })
            }>
              <PlusCircle className="h-4 w-4" />
              Import from Provider
            </Button>
            <Button className="w-full flex items-center justify-center gap-2" variant="outline" onClick={() => 
              toast({
                title: "Feature in Development",
                description: "The ability to upload documents will be available soon.",
              })
            }>
              <PlusCircle className="h-4 w-4" />
              Upload Document
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletPage;
