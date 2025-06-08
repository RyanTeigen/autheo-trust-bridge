
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string;
  timesTaken: number;
  totalDoses: number;
  isOverdue: boolean;
  instructions?: string;
}

const MedicationReminders: React.FC = () => {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      nextDose: new Date(Date.now() + 3600000).toISOString(),
      timesTaken: 5,
      totalDoses: 30,
      isOverdue: false,
      instructions: 'Take with food'
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      nextDose: new Date(Date.now() - 1800000).toISOString(),
      timesTaken: 28,
      totalDoses: 60,
      isOverdue: true,
      instructions: 'Take with meals'
    },
    {
      id: '3',
      name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: 'Once daily',
      nextDose: new Date(Date.now() + 7200000).toISOString(),
      timesTaken: 12,
      totalDoses: 30,
      isOverdue: false
    }
  ]);

  const markAsTaken = (medicationId: string) => {
    setMedications(prev => prev.map(med => {
      if (med.id === medicationId) {
        // Calculate next dose (simplified - would need proper scheduling logic)
        const nextDose = new Date();
        if (med.frequency.includes('twice')) {
          nextDose.setHours(nextDose.getHours() + 12);
        } else {
          nextDose.setDate(nextDose.getDate() + 1);
        }

        return {
          ...med,
          timesTaken: med.timesTaken + 1,
          nextDose: nextDose.toISOString(),
          isOverdue: false
        };
      }
      return med;
    }));

    const medication = medications.find(m => m.id === medicationId);
    toast({
      title: "Medication Taken",
      description: `${medication?.name} has been marked as taken.`,
    });
  };

  const snoozeReminder = (medicationId: string, minutes: number) => {
    setMedications(prev => prev.map(med => {
      if (med.id === medicationId) {
        const nextDose = new Date(med.nextDose);
        nextDose.setMinutes(nextDose.getMinutes() + minutes);
        
        return {
          ...med,
          nextDose: nextDose.toISOString(),
          isOverdue: false
        };
      }
      return med;
    }));

    toast({
      title: "Reminder Snoozed",
      description: `Reminder delayed by ${minutes} minutes.`,
    });
  };

  const getAdherenceColor = (taken: number, total: number) => {
    const percentage = (taken / total) * 100;
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Check for overdue medications
  useEffect(() => {
    const checkOverdue = () => {
      const now = new Date();
      setMedications(prev => prev.map(med => ({
        ...med,
        isOverdue: new Date(med.nextDose) < now
      })));
    };

    const interval = setInterval(checkOverdue, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const overdueMedications = medications.filter(med => med.isOverdue);
  const upcomingMedications = medications.filter(med => !med.isOverdue);

  return (
    <div className="space-y-6">
      {/* Overdue Medications Alert */}
      {overdueMedications.length > 0 && (
        <Card className="bg-red-950/20 border-red-500">
          <CardHeader className="border-b border-red-500/30">
            <CardTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Overdue Medications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {overdueMedications.map((medication) => (
                <div key={medication.id} className="flex justify-between items-center p-3 bg-red-900/20 rounded border border-red-500/30">
                  <div className="flex gap-3">
                    <Pill className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-100">{medication.name}</h4>
                      <p className="text-sm text-red-300">{medication.dosage} - {medication.frequency}</p>
                      <p className="text-xs text-red-400">
                        Due: {new Date(medication.nextDose).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                      onClick={() => snoozeReminder(medication.id, 30)}
                    >
                      Snooze 30m
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => markAsTaken(medication.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Taken
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Medications */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medication Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {medications.map((medication) => (
              <div key={medication.id} className="p-4 border-b border-slate-700 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="mt-1">
                      <Pill className={`h-5 w-5 ${medication.isOverdue ? 'text-red-400' : 'text-blue-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-200">{medication.name}</h4>
                        {medication.isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-300">{medication.dosage} - {medication.frequency}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-slate-400" />
                          <span className="text-xs text-slate-400">
                            Next: {new Date(medication.nextDose).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className={`text-xs ${getAdherenceColor(medication.timesTaken, medication.totalDoses)}`}>
                          Adherence: {Math.round((medication.timesTaken / medication.totalDoses) * 100)}%
                        </div>
                      </div>
                      {medication.instructions && (
                        <p className="text-xs text-slate-400 mt-1">{medication.instructions}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!medication.isOverdue && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => markAsTaken(medication.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Take Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicationReminders;
