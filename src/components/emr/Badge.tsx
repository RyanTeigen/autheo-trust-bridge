
import React from 'react';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type VariantType = 'default' | 'outline' | 'secondary' | 'destructive' | 'success' | 'autheo';

interface BadgeProps {
  variant?: VariantType;
  children: React.ReactNode;
  className?: string;
}

// Extending the shadcn Badge component to add custom variants
const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  let variantClasses = '';
  
  if (variant === 'success') {
    variantClasses = 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800 border-green-200';
  } else if (variant === 'autheo') {
    variantClasses = 'bg-gradient-to-r from-autheo-primary to-autheo-secondary text-autheo-dark hover:opacity-90';
  }
    
  return (
    <ShadcnBadge 
      variant={variant === 'success' || variant === 'autheo' ? 'outline' : variant} 
      className={cn(variantClasses, className)}
    >
      {children}
    </ShadcnBadge>
  );
};

export default Badge;
