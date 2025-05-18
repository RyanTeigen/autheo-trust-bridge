
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string;
}

interface MedicationRemindersCardProps {
  medications: Medication[];
}

const MedicationRemindersCard: React.FC<MedicationRemindersCardProps> = ({ medications }) => {
  const handleMarkTaken = (id: string) => {
    console.log('Marked as taken:', id);
    // In a real app, this would update the state/backend
  };
  
  const handleRefill = () => {
    console.log('Request refill');
    // In a real app, this would navigate to a refill page or open a modal
  };
  
  const getTimeColor = (nextDose: string): string => {
    if (nextDose.includes('Today')) {
      return 'text-amber-300';
    } else {
      return 'text-slate-300';
    }
  };
  
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
          {medications.map((medication) => (
            <div 
              key={medication.id}
              className="p-3 border border-slate-700 bg-slate-800/50 rounded-lg flex justify-between items-start"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Pill className="h-4 w-4 text-autheo-primary" />
                  <span className="font-medium text-slate-100">{medication.name} {medication.dosage}</span>
                </div>
                
                <div className="text-sm text-slate-400">{medication.frequency}</div>
                
                <div className="flex items-center gap-2 mt-1">
                  <Clock className={`h-3.5 w-3.5 ${getTimeColor(medication.nextDose)}`} />
                  <span className={`text-sm ${getTimeColor(medication.nextDose)}`}>
                    Next dose: {medication.nextDose}
                  </span>
                </div>
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                className="border-green-600/30 bg-green-600/10 hover:bg-green-600/20 text-green-400"
                onClick={() => handleMarkTaken(medication.id)}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Mark Taken
              </Button>
            </div>
          ))}
          
          <div className="mt-2">
            <Button 
              onClick={handleRefill}
              variant="outline"
              className="w-full border-slate-700 hover:bg-slate-700/50 text-slate-100"
            >
              Request Medication Refill
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MedicationRemindersCard;
