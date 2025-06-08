
import React from 'react';
import { Loader2, Heart, FileText, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingStateProps {
  type?: 'default' | 'healthcare' | 'security' | 'data';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingStates: React.FC<LoadingStateProps> = ({ 
  type = 'default', 
  message = 'Loading...', 
  size = 'md' 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'healthcare':
        return <Heart className={`animate-pulse text-red-500 ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'}`} />;
      case 'security':
        return <Shield className={`animate-pulse text-green-500 ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'}`} />;
      case 'data':
        return <FileText className={`animate-pulse text-blue-500 ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'}`} />;
      default:
        return <Loader2 className={`animate-spin text-autheo-primary ${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'}`} />;
    }
  };

  const containerClass = `flex items-center justify-center gap-3 ${
    size === 'sm' ? 'p-2' : size === 'lg' ? 'p-8' : 'p-4'
  }`;

  return (
    <div className={containerClass}>
      {getIcon()}
      <span className={`text-slate-300 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
        {message}
      </span>
    </div>
  );
};

export default LoadingStates;
