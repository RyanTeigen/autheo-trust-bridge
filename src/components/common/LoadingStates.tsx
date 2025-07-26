import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Generic loading spinner
export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
  text?: string;
}> = ({ size = 'md', className = '', text }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-2">
        <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
        {text && <span className="text-sm text-muted-foreground">{text}</span>}
      </div>
    </div>
  );
};

// Loading skeleton for medical records
export const MedicalRecordsLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Loading skeleton for dashboard cards
export const DashboardLoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Loading skeleton for patient list
export const PatientListLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Loading skeleton for forms
export const FormLoadingSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
};

// Full page loading state
export const FullPageLoading: React.FC<{ message?: string }> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-lg text-muted-foreground">{message}</p>
    </div>
  );
};

// Inline loading state for buttons and small components
export const InlineLoading: React.FC<{ 
  text?: string; 
  className?: string 
}> = ({ text = "Loading...", className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  );
};

// Error state with retry option
export const ErrorState: React.FC<{
  message: string;
  onRetry?: () => void;
  className?: string;
}> = ({ message, onRetry, className = "" }) => {
  return (
    <div className={`text-center p-8 ${className}`}>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-primary hover:underline text-sm"
        >
          Try again
        </button>
      )}
    </div>
  );
};