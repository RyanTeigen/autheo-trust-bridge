
import React from 'react';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type VariantType = 'default' | 'outline' | 'secondary' | 'destructive' | 'success';

interface BadgeProps {
  variant?: VariantType;
  children: React.ReactNode;
  className?: string;
}

// We're extending the shadcn Badge component to add a success variant
const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className }) => {
  const variantClasses = variant === 'success' 
    ? 'bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800 border-green-200'
    : '';
    
  return (
    <ShadcnBadge variant={variant === 'success' ? 'outline' : variant} className={cn(variantClasses, className)}>
      {children}
    </ShadcnBadge>
  );
};

export default Badge;
