
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ProviderDashboard: React.FC = () => {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: "Feature in Development",
      description: "This provider feature will be available soon.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Provider Dashboard</CardTitle>
        <CardDescription>
          Manage patient records and clinical workflows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleAction}>Schedule Appointment</Button>
          <Button onClick={handleAction} variant="outline">View Patient Queue</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderDashboard;
