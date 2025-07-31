import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Pill, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Calendar,
  MessageSquare,
  TrendingUp,
  User
} from 'lucide-react';
import { useMedications } from '@/hooks/useMedications';
import { useToast } from '@/hooks/use-toast';

interface AdherenceStats {
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  adherencePercentage: number;
}

const PatientPrescriptionDashboard: React.FC = () => {
  const { medications, loading, markAsTaken, requestRefill, getNextDoseTime } = useMedications();
  const [activeTab, setActiveTab] = useState('current');
  const { toast } = useToast();

  // Mock adherence data - would come from real tracking
  const adherenceStats: AdherenceStats = {
    totalDoses: 84, // Last 30 days
    takenDoses: 78,
    missedDoses: 6,
    adherencePercentage: 93
  };

  const activeMedications = medications.filter(med => med.status === 'active');
  const lowRefillMedications = medications.filter(med => med.refills_remaining <= 1);
  const dueTodayMedications = activeMedications.filter(med => {
    const nextDose = getNextDoseTime(med);
    return nextDose.toLowerCase().includes('today');
  });

  const handleTakeMedication = async (medicationId: string, medicationName: string) => {
    await markAsTaken(medicationId);
  };

  const handleRequestRefill = async (medicationId: string) => {
    await requestRefill(medicationId);
  };

  const getAdherenceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100/10 text-green-300 border-green-300/20';
      case 'completed': return 'bg-blue-100/10 text-blue-300 border-blue-300/20';
      case 'discontinued': return 'bg-red-100/10 text-red-300 border-red-300/20';
      default: return 'bg-gray-100/10 text-gray-300 border-gray-300/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-700 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">My Prescriptions</h2>
          <p className="text-slate-400">Track your medications and adherence</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Medications</p>
                <p className="text-2xl font-bold text-slate-100">{activeMedications.length}</p>
              </div>
              <Pill className="h-8 w-8 text-autheo-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Due Today</p>
                <p className="text-2xl font-bold text-amber-400">{dueTodayMedications.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Need Refills</p>
                <p className="text-2xl font-bold text-red-400">{lowRefillMedications.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Adherence Rate</p>
                <p className={`text-2xl font-bold ${getAdherenceColor(adherenceStats.adherencePercentage)}`}>
                  {adherenceStats.adherencePercentage}%
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${getAdherenceColor(adherenceStats.adherencePercentage)}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Adherence Overview */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-autheo-primary" />
            Medication Adherence (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Adherence Progress</span>
              <span className={`font-medium ${getAdherenceColor(adherenceStats.adherencePercentage)}`}>
                {adherenceStats.takenDoses}/{adherenceStats.totalDoses} doses taken
              </span>
            </div>
            <Progress 
              value={adherenceStats.adherencePercentage} 
              className="h-3 bg-slate-700"
            />
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-slate-400">Taken</p>
                <p className="text-green-400 font-medium">{adherenceStats.takenDoses}</p>
              </div>
              <div>
                <p className="text-slate-400">Missed</p>
                <p className="text-red-400 font-medium">{adherenceStats.missedDoses}</p>
              </div>
              <div>
                <p className="text-slate-400">Total</p>
                <p className="text-slate-200 font-medium">{adherenceStats.totalDoses}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="current">Current Medications</TabsTrigger>
          <TabsTrigger value="schedule">Today's Schedule</TabsTrigger>
          <TabsTrigger value="refills">Refill Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <div className="grid gap-4">
            {activeMedications.map((medication) => (
              <Card key={medication.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <Pill className="h-5 w-5 text-autheo-primary" />
                        <h3 className="text-lg font-semibold text-slate-100">
                          {medication.medication_name} {medication.dosage}
                        </h3>
                        <Badge variant="outline" className={getStatusColor(medication.status)}>
                          {medication.status}
                        </Badge>
                        {medication.refills_remaining <= 1 && (
                          <Badge variant="outline" className="bg-red-100/10 text-red-300 border-red-300/20">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Low Stock
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Frequency:</span>
                          <p className="text-slate-200">{medication.frequency}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Next Dose:</span>
                          <p className="text-slate-200">{getNextDoseTime(medication)}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Refills:</span>
                          <p className="text-slate-200">{medication.refills_remaining} remaining</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Prescribed by:</span>
                          <p className="text-slate-200">{medication.prescribed_by}</p>
                        </div>
                      </div>
                      
                      {medication.instructions && (
                        <div className="text-sm">
                          <span className="text-slate-400">Instructions:</span>
                          <p className="text-slate-200">{medication.instructions}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm"
                        onClick={() => handleTakeMedication(medication.id, medication.medication_name)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark Taken
                      </Button>
                      
                      {medication.refills_remaining <= 1 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRequestRefill(medication.id)}
                          className="border-blue-600/30 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Request Refill
                        </Button>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message Provider
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {activeMedications.length === 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-lg font-medium text-slate-400 mb-2">No Active Medications</h3>
                  <p className="text-slate-500">You don't have any active prescriptions at this time.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-autheo-primary" />
                Today's Medication Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dueTodayMedications.map((medication) => (
                  <div key={medication.id} className="flex items-center justify-between p-4 border border-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-amber-400" />
                      <div>
                        <p className="text-slate-100 font-medium">
                          {medication.medication_name} {medication.dosage}
                        </p>
                        <p className="text-slate-400 text-sm">{getNextDoseTime(medication)}</p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleTakeMedication(medication.id, medication.medication_name)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Take Now
                    </Button>
                  </div>
                ))}
                
                {dueTodayMedications.length === 0 && (
                  <div className="text-center py-6">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                    <h3 className="text-lg font-medium text-slate-400 mb-2">All Caught Up!</h3>
                    <p className="text-slate-500">No medications due today.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refills" className="space-y-4">
          <div className="grid gap-4">
            {lowRefillMedications.map((medication) => (
              <Card key={medication.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-5 w-5 text-autheo-primary" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-100">
                          {medication.medication_name} {medication.dosage}
                        </h3>
                        <p className="text-slate-400">
                          {medication.refills_remaining} refills remaining
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-400 text-sm">Prescribed by {medication.prescribed_by}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleRequestRefill(medication.id)}
                      className="bg-autheo-primary hover:bg-autheo-primary/90"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Request Refill
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {lowRefillMedications.length === 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-lg font-medium text-slate-400 mb-2">No Refills Needed</h3>
                  <p className="text-slate-500">All your medications have sufficient refills.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientPrescriptionDashboard;