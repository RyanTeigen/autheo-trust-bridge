
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MedicalNotesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Medical Notes</h1>
        <p className="text-muted-foreground">
          Manage clinical notes and patient documentation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clinical Documentation</CardTitle>
          <CardDescription>
            Create and manage medical notes for patient records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will provide tools for creating, editing, and managing clinical notes.
            Implementation coming in the next development phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalNotesPage;
