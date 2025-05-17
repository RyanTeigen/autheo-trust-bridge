
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Provider {
  name: string;
  role: string;
  accessLevel: string;
}

interface ApprovedAccessProps {
  providers: Provider[];
}

const ApprovedAccess: React.FC<ApprovedAccessProps> = ({ providers }) => {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Approved Access</CardTitle>
        <CardDescription>
          Providers with access to your records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {providers.map((provider, index) => (
            <div key={index} className="p-3 border rounded-md flex justify-between items-center">
              <div>
                <p className="font-medium">{provider.name}</p>
                <p className="text-sm text-muted-foreground">{provider.role} - {provider.accessLevel}</p>
              </div>
              <Button size="sm" variant="outline">Manage</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovedAccess;
