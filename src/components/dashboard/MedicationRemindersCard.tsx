
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Pill, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMedications, type Medication } from '@/hooks/useMedications';

interface MedicationRemindersCardProps {
  medications: Medication[];
  loading?: boolean;
}

const MedicationRemindersCard: React.FC<MedicationRemindersCardProps> = ({ medications, loading = false }) => {
  const { markAsTaken, requestRefill } = useMedications();
  
  const handleMarkTaken = async (id: string, medicationName: string) => {
    await markAsTaken(id);
  };
  
  const handleRefill = async (id: string) => {
    await requestRefill(id);
  };
  
  const getTimeColor = (medication: Medication): string => {
    const nextDose = getNextDoseTime(medication);
    if (nextDose.toLowerCase().includes('today')) {
      return 'text-amber-300';
    } else {
      return 'text-slate-300';
    }
  };

  const isDueToday = (medication: Medication): boolean => {
    const nextDose = getNextDoseTime(medication);
    return nextDose.toLowerCase().includes('today');
  };

  const needsRefill = (medication: Medication): boolean => {
    return medication.refills_remaining <= 1;
  };

  const getNextDoseTime = (medication: Medication): string => {
    // Simple calculation - in real app this would be more sophisticated
    const now = new Date();
    if (medication.frequency.toLowerCase().includes('once')) {
      return 'Tomorrow, 8:00 AM';
    } else if (medication.frequency.toLowerCase().includes('twice')) {
      return 'Today, 8:00 PM';
    }
    return 'Next dose calculated';
  };

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <CardTitle className="text-autheo-primary">Medication Reminders</CardTitle>
          <CardDescription className="text-slate-300">
            Keep track of your medication schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border border-slate-700 bg-slate-800/50 rounded-lg">
                <Skeleton className="h-4 w-32 mb-2 bg-slate-700" />
                <Skeleton className="h-3 w-24 mb-1 bg-slate-700" />
                <Skeleton className="h-3 w-28 bg-slate-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary">Medication Reminders</CardTitle>
        <CardDescription className="text-slate-300">
          Keep track of your medication schedule
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3">
          {medications.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No medications to track</p>
            </div>
          ) : (
            medications.map((medication) => (
              <div 
                key={medication.id}
                className={`p-3 border border-slate-700 bg-slate-800/50 rounded-lg ${
                  isDueToday(medication) ? 'ring-2 ring-amber-400/30' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-autheo-primary" />
                    <span className="font-medium text-slate-100">{medication.medication_name} {medication.dosage}</span>
                    {needsRefill(medication) && (
                      <Badge variant="outline" className="bg-red-100/10 text-red-300 border-red-300/20">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low Stock
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {needsRefill(medication) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-7 px-2 border-blue-600/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400"
                        onClick={() => handleRefill(medication.id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refill
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 px-2 border-green-600/30 bg-green-600/10 hover:bg-green-600/20 text-green-400"
                      onClick={() => handleMarkTaken(medication.id, medication.medication_name)}
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Taken
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-slate-400 mb-1">{medication.frequency}</div>
                
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`h-3.5 w-3.5 ${getTimeColor(medication)}`} />
                  <span className={`text-sm ${getTimeColor(medication)}`}>
                    Next dose: {getNextDoseTime(medication)}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mt-1">
                  Prescribed by {medication.prescribed_by} • {medication.refills_remaining} refills remaining
                </div>
              </div>
            ))
          )}
          
          <div className="mt-2">
            <Button 
              onClick={() => console.log('Navigate to full medication management')}
              variant="outline"
              className="w-full border-slate-700 hover:bg-slate-700/50 text-slate-100"
            >
              <Pill className="h-4 w-4 mr-2" />
              Manage All Medications
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationRemindersCard;
