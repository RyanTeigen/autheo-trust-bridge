
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface Medication {
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
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleViewMore = () => {
    toast({
      title: "View More: Medications",
      description: "Navigating to full medications view."
    });
    navigate('/wallet');
  };
  
  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader className="border-b border-slate-700 bg-slate-700/30">
        <CardTitle className="text-autheo-primary flex items-center">
          <Bell className="mr-2 h-5 w-5 text-autheo-primary" /> Medication Reminders
        </CardTitle>
        <CardDescription className="text-slate-300">Upcoming medication doses</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        {medications.length > 0 ? (
          <div className="space-y-3">
            {medications.map((medication) => (
              <div key={medication.id} className="p-3 rounded-md border border-slate-700 bg-slate-700/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-autheo-primary">{medication.name} {medication.dosage}</p>
                    <p className="text-sm text-slate-300">{medication.frequency}</p>
                    <p className="text-xs text-autheo-primary mt-1">Next: {medication.nextDose}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-7 text-slate-300 hover:bg-slate-700 hover:text-autheo-primary"
                  >
                    Mark taken
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="mt-2 flex justify-end">
              <Button 
                variant="link" 
                className="text-autheo-primary hover:text-autheo-primary/80 p-0"
                onClick={handleViewMore}
              >
                View all medications
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-slate-300">No medication reminders</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MedicationRemindersCard;
