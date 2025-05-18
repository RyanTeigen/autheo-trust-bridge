
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Clock, Lock } from 'lucide-react';

interface EmptyStateCardProps {
  type: 'active' | 'pending' | 'expired';
  onCreateNew?: () => void;
}

const EmptyStateCard: React.FC<EmptyStateCardProps> = ({ type, onCreateNew }) => {
  const renderContent = () => {
    switch (type) {
      case 'active':
        return (
          <>
            <Users className="h-10 w-10 text-slate-400 mb-4" />
            <p className="text-slate-300 mb-2">
              No active shared records found
            </p>
            <p className="text-sm text-slate-400 mb-4">
              Use the "Share New Records" button to start sharing your health information
            </p>
            {onCreateNew && (
              <Button 
                variant="outline" 
                className="bg-slate-800 border-slate-600 text-autheo-primary hover:border-autheo-primary hover:bg-slate-700"
                onClick={onCreateNew}
              >
                Share New Records
              </Button>
            )}
          </>
        );
      case 'pending':
        return (
          <>
            <Clock className="h-10 w-10 text-slate-400 mb-4" />
            <p className="text-slate-300">
              No pending shared records
            </p>
          </>
        );
      case 'expired':
        return (
          <>
            <Lock className="h-10 w-10 text-slate-400 mb-4" />
            <p className="text-slate-300">
              No expired shared records
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-slate-800/40 border-slate-700">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
