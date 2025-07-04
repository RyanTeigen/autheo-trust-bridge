
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, User } from 'lucide-react';
import PatientSearch from '@/components/emr/PatientSearch';
import PatientDetails from '@/components/emr/PatientDetails';
import HealthDataChart from '@/components/emr/HealthDataChart';
import { useToast } from '@/hooks/use-toast';
import { AuditLogService } from '@/services/AuditLogService';
import { supabase } from '@/integrations/supabase/client';

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

const PatientSearchTab: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');
  const { toast } = useToast();

  const handleSelectPatient = async (patientId: string) => {
    try {
      // Get patient name from database
      const { data: patient, error } = await supabase
        .from('patients')
        .select('full_name')
        .eq('id', patientId)
        .single();

      const patientName = patient?.full_name || 'Unknown Patient';
      
      setSelectedPatientId(patientId);
      setSelectedPatientName(patientName);
      
      toast({
        title: "Patient Selected",
        description: `Selected: ${patientName}`,
      });
      
      // Log this access in the audit system
      AuditLogService.logPatientAccess(
        patientId,
        patientName,
        'Viewed patient record from provider portal',
        'success',
        'Selected from consolidated patient search'
      );
    } catch (error) {
      console.error('Error selecting patient:', error);
      toast({
        title: "Error",
        description: "Failed to select patient. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTimeRangeChange = (range: string) => {
    if (selectedPatientId && selectedPatientName) {
      toast({
        title: "Time Range Changed",
        description: `New range: ${range}`,
      });
      
      // Log this access in the audit system
      AuditLogService.logPatientAccess(
        selectedPatientId,
        selectedPatientName,
        `Changed data view time range to ${range}`,
        'success',
        'From provider portal patient search'
      );
    }
  };

  return (
    <div className="space-y-6">
      {!selectedPatientId ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center text-autheo-primary">
              <User className="h-5 w-5 mr-2" />
              Patient Search
            </CardTitle>
            <CardDescription className="text-slate-400">
              Find patients by name, ID, or medical record number to access their health information.
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
            <h3 className="text-xl font-bold tracking-tight mb-4 flex items-center text-slate-200">
              <Search className="h-5 w-5 mr-2 text-autheo-primary" />
              Health Data Visualization
            </h3>
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

export default PatientSearchTab;
