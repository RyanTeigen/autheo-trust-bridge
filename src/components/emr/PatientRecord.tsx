
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface PatientRecordProps {
  id?: string;
  patientName?: string;
}

const PatientRecord: React.FC<PatientRecordProps> = ({ 
  id = "new", 
  patientName = "New Patient" 
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{patientName}</CardTitle>
        <CardDescription>
          Patient ID: {id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="encounters">Encounters</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Patient summary information will be displayed here.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="records" className="mt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Patient health records will be displayed here.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="encounters" className="mt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Patient encounters will be displayed here.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Patient orders will be displayed here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PatientRecord;
