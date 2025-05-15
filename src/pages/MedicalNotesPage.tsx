
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SOAPNoteForm from '@/components/emr/SOAPNoteForm';
import RecentNotesList from '@/components/emr/RecentNotesList';

const MedicalNotesPage = () => {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Medical Notes</h1>
        <p className="text-muted-foreground">
          Create and manage clinical documentation for patient records
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create New Note</TabsTrigger>
          <TabsTrigger value="recent">Recent Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>SOAP Note Documentation</CardTitle>
              <CardDescription>
                Create a structured clinical note following the SOAP format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SOAPNoteForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Clinical Notes</CardTitle>
              <CardDescription>
                View and manage recently created clinical documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentNotesList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalNotesPage;
