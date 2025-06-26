
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { useAtomicVitals } from '@/hooks/useAtomicVitals';
import { VitalsLoadingState } from './vital-signs/VitalsLoadingState';
import { VitalsErrorState } from './vital-signs/VitalsErrorState';
import { VitalsEmptyState } from './vital-signs/VitalsEmptyState';
import { VitalItem } from './vital-signs/VitalItem';

const AtomicVitalsCard: React.FC = () => {
  const { decryptedVitals, loading, error } = useAtomicVitals();

  if (loading) {
    return <VitalsLoadingState />;
  }

  if (error) {
    return <VitalsErrorState error={error} />;
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-autheo-primary" />
          Your Latest Vitals
        </CardTitle>
        <CardDescription>
          Securely encrypted vital signs from your atomic data points
        </CardDescription>
      </CardHeader>
      <CardContent>
        {decryptedVitals.length === 0 ? (
          <VitalsEmptyState />
        ) : (
          <div className="space-y-3">
            {decryptedVitals.map((vital, index) => (
              <VitalItem 
                key={index} 
                vital={vital} 
                index={index} 
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AtomicVitalsCard;
