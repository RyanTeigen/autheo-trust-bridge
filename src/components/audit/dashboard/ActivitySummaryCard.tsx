
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ActivitySummaryCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
}

const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({ icon, title, count, color }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{count}</h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivitySummaryCard;
