
import React from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface VitalsErrorStateProps {
  error: string;
}

export const VitalsErrorState: React.FC<VitalsErrorStateProps> = ({ error }) => {
  return (
    <Card className="w-full max-w-2xl border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Activity className="h-5 w-5" />
          Your Latest Vitals
        </CardTitle>
        <CardDescription className="text-red-500">{error}</CardDescription>
      </CardHeader>
    </Card>
  );
};
