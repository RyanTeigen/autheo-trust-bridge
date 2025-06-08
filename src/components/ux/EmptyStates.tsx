
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, Calendar, Heart, Plus, Search } from 'lucide-react';

interface EmptyStateProps {
  type: 'records' | 'appointments' | 'patients' | 'health-data' | 'general';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyStates: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionLabel,
  onAction
}) => {
  const getConfig = () => {
    switch (type) {
      case 'records':
        return {
          icon: <FileText className="h-12 w-12 text-slate-400" />,
          defaultTitle: 'No Medical Records',
          defaultDescription: 'You haven\'t uploaded any medical records yet. Start by adding your first record.',
          defaultAction: 'Add Record'
        };
      case 'appointments':
        return {
          icon: <Calendar className="h-12 w-12 text-slate-400" />,
          defaultTitle: 'No Appointments Scheduled',
          defaultDescription: 'You don\'t have any upcoming appointments. Schedule one to get started.',
          defaultAction: 'Schedule Appointment'
        };
      case 'patients':
        return {
          icon: <Users className="h-12 w-12 text-slate-400" />,
          defaultTitle: 'No Patients Found',
          defaultDescription: 'No patients match your current search criteria. Try adjusting your filters.',
          defaultAction: 'Clear Filters'
        };
      case 'health-data':
        return {
          icon: <Heart className="h-12 w-12 text-slate-400" />,
          defaultTitle: 'No Health Data',
          defaultDescription: 'Start tracking your health metrics to see trends and insights.',
          defaultAction: 'Add Health Data'
        };
      default:
        return {
          icon: <Search className="h-12 w-12 text-slate-400" />,
          defaultTitle: 'No Results Found',
          defaultDescription: 'We couldn\'t find any results matching your criteria.',
          defaultAction: 'Try Again'
        };
    }
  };

  const config = getConfig();

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4">
          {config.icon}
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          {title || config.defaultTitle}
        </h3>
        <p className="text-slate-400 mb-6 max-w-md">
          {description || config.defaultDescription}
        </p>
        {onAction && (
          <Button 
            onClick={onAction}
            className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
          >
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel || config.defaultAction}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EmptyStates;
