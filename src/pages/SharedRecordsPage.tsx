
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SharedRecordsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Shared Records</h1>
        <p className="text-muted-foreground">
          Manage who has access to your health information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Shares</CardTitle>
          <CardDescription>
            View and manage records you're currently sharing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will show all healthcare providers and organizations that currently
            have access to your health records. Implementation coming in the next development phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedRecordsPage;
