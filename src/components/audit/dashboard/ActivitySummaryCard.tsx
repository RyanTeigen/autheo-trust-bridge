
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ActivitySummaryCardProps {
  icon: React.ReactNode;
  title: string;
  count: number;
  color: string;
  subtitle?: string;
}

const ActivitySummaryCard: React.FC<ActivitySummaryCardProps> = ({ 
  icon, 
  title, 
  count, 
  color,
  subtitle 
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{count.toLocaleString()}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivitySummaryCard;
