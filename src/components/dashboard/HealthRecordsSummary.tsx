
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HealthRecord {
  title: string;
  provider: string;
  date: string;
}

interface HealthRecordsSummaryProps {
  records: HealthRecord[];
}

const HealthRecordsSummary: React.FC<HealthRecordsSummaryProps> = ({ records }) => {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Recent Health Records</CardTitle>
        <CardDescription>
          Your latest medical information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.map((record, index) => (
            <div key={index} className="p-3 border rounded-md flex justify-between items-center">
              <div>
                <p className="font-medium">{record.title}</p>
                <p className="text-sm text-muted-foreground">{record.provider} - {record.date}</p>
              </div>
              <Button size="sm" variant="ghost">View</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthRecordsSummary;
