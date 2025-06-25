
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Shield, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BlockedRecordStateProps {
  reason?: string;
  variant?: 'revoked' | 'expired' | 'unauthorized';
  recordTitle?: string;
}

const BlockedRecordState: React.FC<BlockedRecordStateProps> = ({ 
  reason = 'Access to this record has been revoked by the patient',
  variant = 'revoked',
  recordTitle 
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'revoked':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'unauthorized':
        return <Lock className="h-5 w-5 text-gray-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'revoked':
        return 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800';
      case 'expired':
        return 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800';
      case 'unauthorized':
        return 'border-gray-200 bg-gray-50 dark:bg-gray-950/20 dark:border-gray-700';
      default:
        return 'border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'revoked':
        return 'text-red-700 dark:text-red-300';
      case 'expired':
        return 'text-orange-700 dark:text-orange-300';
      case 'unauthorized':
        return 'text-gray-700 dark:text-gray-300';
      default:
        return 'text-red-700 dark:text-red-300';
    }
  };

  return (
    <Card className={`${getVariantStyles()} border-2`}>
      <CardContent className="p-6">
        <Alert className="border-0 bg-transparent p-0">
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
              <AlertDescription className={`${getTextColor()} font-medium`}>
                {recordTitle && (
                  <div className="mb-2 font-semibold">
                    Record: {recordTitle}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span>❌</span>
                  <span>{reason}</span>
                </div>
                {variant === 'expired' && (
                  <div className="mt-2 text-sm opacity-75">
                    Please contact the patient to request renewed access.
                  </div>
                )}
                {variant === 'revoked' && (
                  <div className="mt-2 text-sm opacity-75">
                    The patient has permanently revoked access to this record.
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BlockedRecordState;
