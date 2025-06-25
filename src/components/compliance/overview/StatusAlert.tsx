
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

interface StatusAlertProps {
  score: number;
}

const StatusAlert: React.FC<StatusAlertProps> = ({ score }) => {
  return (
    <Alert className={`${score >= 90 ? 'bg-green-900/20 border-green-500/30' : 'bg-amber-900/20 border-amber-500/30'}`}>
      <CheckCircle className="h-4 w-4" />
      <AlertDescription className={`${score >= 90 ? 'text-green-200' : 'text-amber-200'}`}>
        {score >= 90 
          ? 'Your organization maintains a strong compliance posture. Continue monitoring critical areas for improvement.'
          : 'Your compliance score needs attention. Review the priority actions and address critical issues.'
        }
      </AlertDescription>
    </Alert>
  );
};

export default StatusAlert;
