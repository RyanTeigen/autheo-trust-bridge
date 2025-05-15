
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProviderDashboard from '@/components/emr/ProviderDashboard';

const ProviderPortalPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Provider Portal</h1>
        <p className="text-muted-foreground">
          Access and manage patient health records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Dashboard</CardTitle>
          <CardDescription>
            Access to patient information based on permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderDashboard />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderPortalPage;
