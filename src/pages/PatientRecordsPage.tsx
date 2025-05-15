
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import PatientRecord from '@/components/emr/PatientRecord';

const PatientRecordsPage = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Patient Records</h1>
        <p className="text-muted-foreground">
          View and manage patient health information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Dashboard</CardTitle>
          <CardDescription>
            Access your comprehensive health record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientRecord 
            id="P12345"
            patientName="John Doe"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientRecordsPage;
