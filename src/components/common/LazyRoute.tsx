
import React, { Suspense } from 'react';
import ProductionLoadingState from '../ux/ProductionLoadingState';
import ErrorBoundary from '../ux/ErrorBoundary';

interface LazyRouteProps {
  children?: React.ReactNode;
  component?: React.ComponentType<any>;
  fallback?: React.ReactNode;
}

const LazyRoute: React.FC<LazyRouteProps> = ({ 
  children, 
  component: Component,
  fallback = <ProductionLoadingState type="page" message="Loading..." /> 
}) => {
  return (
    <ErrorBoundary fallback={<div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-100">Failed to load page</div>}>
      <Suspense fallback={fallback}>
        {Component ? <Component /> : children}
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyRoute;
