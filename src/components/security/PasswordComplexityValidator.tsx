import React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordComplexityValidatorProps {
  password: string;
  className?: string;
}

interface ValidationRule {
  label: string;
  isValid: (password: string) => boolean;
}

const validationRules: ValidationRule[] = [
  {
    label: 'At least 8 characters',
    isValid: (password) => password.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    isValid: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'Contains lowercase letter',
    isValid: (password) => /[a-z]/.test(password),
  },
  {
    label: 'Contains number',
    isValid: (password) => /[0-9]/.test(password),
  },
  {
    label: 'Contains special character',
    isValid: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export const PasswordComplexityValidator: React.FC<PasswordComplexityValidatorProps> = ({
  password,
  className,
}) => {
  const allValid = validationRules.every(rule => rule.isValid(password));

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn(
          'w-3 h-3 rounded-full transition-colors',
          allValid ? 'bg-success' : 'bg-destructive'
        )} />
        <span className="text-sm font-medium">
          Password Strength: {allValid ? 'Strong' : 'Weak'}
        </span>
      </div>
      
      <div className="space-y-1">
        {validationRules.map((rule, index) => {
          const isValid = rule.isValid(password);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {isValid ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <X className="w-4 h-4 text-destructive" />
              )}
              <span className={cn(
                'transition-colors',
                isValid ? 'text-success' : 'text-muted-foreground'
              )}>
                {rule.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const validatePasswordComplexity = (password: string): boolean => {
  return validationRules.every(rule => rule.isValid(password));
};