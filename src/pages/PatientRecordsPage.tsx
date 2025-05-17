import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PatientSearch from '@/components/emr/PatientSearch';
import PatientDetails from '@/components/emr/PatientDetails';
import HealthDataChart from '@/components/emr/HealthDataChart';
import { AuditLogService } from '@/services/AuditLogService';
import { Database, User, Activity } from 'lucide-react';

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

// Mock patient mapping - in a real app this would be fetched from an API
const patientNameMap: Record<string, string> = {
  'PAT001': 'John Smith',
  'PAT002': 'Maria Garcia',
  'PAT003': 'Robert Johnson',
  'PAT004': 'Jessica Williams',
  'PAT005': 'David Lee',
};

const PatientRecordsPage = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { toast } = useToast();
  const [accessStartTime, setAccessStartTime] = useState<number | null>(null);

  // Log page access when component mounts
  useEffect(() => {
    const startTime = Date.now();
    setAccessStartTime(startTime);
    
    AuditLogService.logSecurityEvent(
      'access',
      'Accessed patient records page',
      'success',
      'Initial page load'
    );
    
    // Cleanup function - log when user leaves the page
    return () => {
      if (accessStartTime) {
        const duration = Date.now() - accessStartTime;
        AuditLogService.logSecurityEvent(
          'access',
          'Exited patient records page',
          'success',
          `Duration: ${duration}ms`
        );
      }
    };
  }, []);

  const handleSelectPatient = (patientId: string) => {
    const startTime = Date.now();
    const patientName = patientNameMap[patientId] || 'Unknown Patient';
    
    setSelectedPatientId(patientId);
    toast({
      title: "Patient Selected",
      description: `Patient ID: ${patientId}`,
    });
    
    // Calculate how long it took the user to select a patient
    const selectionTime = accessStartTime ? Date.now() - accessStartTime : null;
    
    // Log this access in the audit system with duration
    AuditLogService.logPatientAccess(
      patientId,
      patientName,
      'Viewed patient record',
      'success',
      `Selected from patient search${selectionTime ? `. Selection time: ${selectionTime}ms` : ''}`,
      selectionTime || undefined
    );
  };

  const handleTimeRangeChange = (range: string) => {
    if (selectedPatientId) {
      const patientName = patientNameMap[selectedPatientId] || 'Unknown Patient';
      
      toast({
        title: "Time Range Changed",
        description: `New range: ${range}`,
      });
      
      // Log this access in the audit system
      AuditLogService.logPatientAccess(
        selectedPatientId,
        patientName,
        `Changed data view time range to ${range}`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2 flex items-center">
          <Database className="h-6 w-6 mr-2 text-autheo-primary" />
          Patient Records
        </h1>
        <p className="text-muted-foreground">
          Search, view, and manage patient health information
        </p>
      </div>

      {!selectedPatientId ? (
        <Card className="shadow-sm border-autheo-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-autheo-primary" />
              Patient Search
            </CardTitle>
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
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-autheo-primary" />
              Health Data
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HealthDataChart 
                title="Blood Pressure (Systolic)"
                description="Measured in mmHg"
                data={mockBloodPressureData}
                unit="mmHg"
                minValue={90}
                maxValue={140}
                timeRange="1m"
                onTimeRangeChange={handleTimeRangeChange}
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
                onTimeRangeChange={handleTimeRangeChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecordsPage;
