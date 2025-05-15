
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PatientSearch from '@/components/emr/PatientSearch';
import PatientDetails from '@/components/emr/PatientDetails';
import HealthDataChart from '@/components/emr/HealthDataChart';

// Mock health data for visualization
const mockBloodPressureData = [
  { date: '2025-04-01', value: 120 },
  { date: '2025-04-05', value: 118 },
  { date: '2025-04-10', value: 122 },
  { date: '2025-04-15', value: 125 },
  { date: '2025-04-20', value: 121 },
  { date: '2025-04-25', value: 119 },
  { date: '2025-05-01', value: 118 },
  { date: '2025-05-05', value: 120 },
  { date: '2025-05-10', value: 117 },
];

const mockGlucoseData = [
  { date: '2025-04-01', value: 95 },
  { date: '2025-04-05', value: 100 },
  { date: '2025-04-10', value: 98 },
  { date: '2025-04-15', value: 103 },
  { date: '2025-04-20', value: 97 },
  { date: '2025-04-25', value: 96 },
  { date: '2025-05-01', value: 99 },
  { date: '2025-05-05', value: 101 },
  { date: '2025-05-10', value: 98 },
];

const PatientRecordsPage = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    toast({
      title: "Patient Selected",
      description: `Patient ID: ${patientId}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Patient Records</h1>
        <p className="text-muted-foreground">
          Search, view, and manage patient health information
        </p>
      </div>

      {!selectedPatientId ? (
        <Card>
          <CardHeader>
            <CardTitle>Patient Search</CardTitle>
            <CardDescription>
              Find patients by name, ID, or medical record number
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PatientSearch onSelectPatient={handleSelectPatient} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <PatientDetails patientId={selectedPatientId} />
          
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Health Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HealthDataChart 
                title="Blood Pressure (Systolic)"
                description="Measured in mmHg"
                data={mockBloodPressureData}
                unit="mmHg"
                minValue={90}
                maxValue={140}
                timeRange="1m"
                onTimeRangeChange={(range) => {
                  toast({
                    title: "Time Range Changed",
                    description: `New range: ${range}`,
                  });
                }}
              />
              
              <HealthDataChart 
                title="Blood Glucose"
                description="Measured in mg/dL"
                data={mockGlucoseData}
                unit="mg/dL"
                color="#F97316"
                minValue={70}
                maxValue={120}
                timeRange="1m"
                onTimeRangeChange={(range) => {
                  toast({
                    title: "Time Range Changed",
                    description: `New range: ${range}`,
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecordsPage;
