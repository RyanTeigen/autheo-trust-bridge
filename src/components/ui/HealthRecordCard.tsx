
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export type RecordCategory = 'medication' | 'condition' | 'lab' | 'imaging' | 'note' | 'visit';

export interface HealthRecordCardProps {
  id: string;
  title: string;
  date: string;
  provider: string;
  category: RecordCategory;
  details: string;
  isShared: boolean;
  onToggleShare: (id: string, shared: boolean) => void;
  className?: string;
}

export const HealthRecordCard: React.FC<HealthRecordCardProps> = ({
  id,
  title,
  date,
  provider,
  category,
  details,
  isShared,
  onToggleShare,
  className,
}) => {
  const getCategoryColor = () => {
    switch (category) {
      case 'medication': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'condition': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'lab': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'imaging': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'note': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'visit': return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
    }
  };

  const handleToggle = (checked: boolean) => {
    onToggleShare(id, checked);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className={getCategoryColor()}>
              {category}
            </Badge>
            <CardTitle className="mt-2">{title}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`share-${id}`} className="text-xs">Share</Label>
            <Switch 
              id={`share-${id}`} 
              checked={isShared} 
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {details}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <span>{new Date(date).toLocaleDateString()}</span>
        <span>{provider}</span>
      </CardFooter>
    </Card>
  );
};

export default HealthRecordCard;
