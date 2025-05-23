
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface NoteViewerSkeletonProps {
  loading?: boolean;
  error?: string;
}

const NoteViewerSkeleton: React.FC<NoteViewerSkeletonProps> = ({ 
  loading = false, 
  error 
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Loading note details...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return null;
};

export default NoteViewerSkeleton;
