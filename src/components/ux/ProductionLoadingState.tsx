
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductionLoadingStateProps {
  type?: 'page' | 'component' | 'data' | 'skeleton';
  message?: string;
  showSkeleton?: boolean;
  skeletonRows?: number;
}

const ProductionLoadingState: React.FC<ProductionLoadingStateProps> = ({ 
  type = 'component', 
  message,
  showSkeleton = false,
  skeletonRows = 3
}) => {
  if (showSkeleton || type === 'skeleton') {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const getLoadingContent = () => {
    switch (type) {
      case 'page':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100">
            <Loader2 className="h-8 w-8 animate-spin text-autheo-primary mb-4" />
            <p className="text-lg text-slate-300">{message || 'Loading page...'}</p>
          </div>
        );
      case 'data':
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-autheo-primary mb-2" />
            <p className="text-sm text-slate-400">{message || 'Loading data...'}</p>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-autheo-primary mr-2" />
            <span className="text-slate-300">{message || 'Loading...'}</span>
          </div>
        );
    }
  };

  return getLoadingContent();
};

export default ProductionLoadingState;
