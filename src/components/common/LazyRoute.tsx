
import React, { Suspense } from 'react';
import ProductionLoadingState from '../ux/ProductionLoadingState';
import ErrorBoundary from '../ux/ErrorBoundary';

interface LazyRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const LazyRoute: React.FC<LazyRouteProps> = ({ 
  children, 
  fallback = <ProductionLoadingState type="page" message="Loading..." /> 
}) => {
  return (
    <ErrorBoundary fallback={<div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">Failed to load page</div>}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyRoute;
