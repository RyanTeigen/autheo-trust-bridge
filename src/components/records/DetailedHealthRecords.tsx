
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pill, File, Syringe, TestTube, Calendar, ChartBar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import HealthMetricsCharts from '@/components/records/HealthMetricsCharts';
import AllergiesCard from '@/components/records/AllergiesCard';

// Types for health records
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  refillDate: string;
  prescribedBy: string;
}

interface Diagnosis {
  id: string;
  condition: string;
  diagnosedDate: string;
  diagnosedBy: string;
  status: 'active' | 'resolved' | 'chronic';
  notes?: string;
}

interface Immunization {
  id: string;
  name: string;
  date: string;
  administeredBy: string;
  lotNumber?: string;
  nextDose?: string;
}

interface MedicalTest {
  id: string;
  name: string;
  date: string;
  orderedBy: string;
  results?: string;
  status: 'pending' | 'completed' | 'canceled';
}

interface DetailedHealthRecordsProps {
  medications: Medication[];
  diagnoses: Diagnosis[];
  immunizations: Immunization[];
  medicalTests: MedicalTest[];
  allergies?: {
    id: string;
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    reaction: string;
    diagnosed: string;
  }[];
}

const DetailedHealthRecords: React.FC<DetailedHealthRecordsProps> = ({ 
  medications,
  diagnoses,
  immunizations,
  medicalTests,
  allergies = [] // Default to empty array if not provided
}) => {
  // Helper function to calculate days until refill
  const getDaysUntilRefill = (refillDate: string): number => {
    const today = new Date();
    const refill = new Date(refillDate);
    const diffTime = refill.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper function to get refill status badge
  const getRefillStatusBadge = (refillDate: string) => {
    const daysUntil = getDaysUntilRefill(refillDate);
    
    if (daysUntil <= 0) {
      return <Badge variant="destructive">Refill Now</Badge>;
    } else if (daysUntil <= 7) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800">Refill Soon</Badge>;
    } else {
      return <Badge variant="outline">Refill in {daysUntil} days</Badge>;
    }
  };

  // Helper function to get diagnosis status badge
  const getDiagnosisStatusBadge = (status: Diagnosis['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'chronic':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Chronic</Badge>;
    }
  };

  // Helper function to get test status badge
  const getTestStatusBadge = (status: MedicalTest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Canceled</Badge>;
    }
  };

  return (
    <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader>
        <CardTitle>My Health Records</CardTitle>
        <CardDescription>
          View your health metrics, allergies, medications, diagnoses, immunizations, and medical tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="metrics" className="w-full">
          <TabsList className="grid grid-cols-6 mb-4 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="metrics" className="flex items-center gap-1">
              <ChartBar className="h-4 w-4" /> Metrics
            </TabsTrigger>
            <TabsTrigger value="allergies" className="flex items-center gap-1">
              <Pill className="h-4 w-4" /> Allergies
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-1">
              <Pill className="h-4 w-4" /> Medications
            </TabsTrigger>
            <TabsTrigger value="diagnoses" className="flex items-center gap-1">
              <File className="h-4 w-4" /> Diagnoses
            </TabsTrigger>
            <TabsTrigger value="immunizations" className="flex items-center gap-1">
              <Syringe className="h-4 w-4" /> Immunizations
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-1">
              <TestTube className="h-4 w-4" /> Medical Tests
            </TabsTrigger>
          </TabsList>
          
          {/* Health Metrics Tab */}
          <TabsContent value="metrics">
            <HealthMetricsCharts />
          </TabsContent>
          
          {/* Allergies Tab */}
          <TabsContent value="allergies">
            <AllergiesCard allergies={allergies} />
          </TabsContent>
          
          {/* Medications Tab */}
          <TabsContent value="medications">
            <div className="space-y-4">
              {medications.length > 0 ? (
                medications.map(med => (
                  <Card key={med.id} className="overflow-hidden bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50">
                    <CardHeader className="pb-2 bg-blue-100/70 dark:bg-blue-800/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{med.name}</CardTitle>
                          <CardDescription className="text-blue-700 dark:text-blue-300">{med.dosage}, {med.frequency}</CardDescription>
                        </div>
                        {getRefillStatusBadge(med.refillDate)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-blue-600 dark:text-blue-400">Started</p>
                          <p className="font-medium flex items-center gap-1 text-blue-800 dark:text-blue-200">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            {new Date(med.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600 dark:text-blue-400">Refill Due</p>
                          <p className="font-medium flex items-center gap-1 text-blue-800 dark:text-blue-200">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            {new Date(med.refillDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        Prescribed by {med.prescribedBy}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No medication records found
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Diagnoses Tab */}
          <TabsContent value="diagnoses">
            <div className="space-y-4">
              {diagnoses.length > 0 ? (
                diagnoses.map(diagnosis => (
                  <Card key={diagnosis.id} className="overflow-hidden bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/50">
                    <CardHeader className="pb-2 bg-purple-100/70 dark:bg-purple-800/30">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{diagnosis.condition}</CardTitle>
                        {getDiagnosisStatusBadge(diagnosis.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-purple-600 dark:text-purple-400">Diagnosed</p>
                          <p className="font-medium flex items-center gap-1 text-purple-800 dark:text-purple-200">
                            <Calendar className="h-3.5 w-3.5 text-purple-500" />
                            {new Date(diagnosis.diagnosedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-purple-600 dark:text-purple-400">Diagnosed By</p>
                          <p className="font-medium text-purple-800 dark:text-purple-200">{diagnosis.diagnosedBy}</p>
                        </div>
                      </div>
                      {diagnosis.notes && (
                        <div className="mt-2">
                          <p className="text-purple-600 dark:text-purple-400">Notes</p>
                          <p className="mt-1 p-2 bg-purple-100/50 dark:bg-purple-900/40 rounded text-purple-800 dark:text-purple-200">{diagnosis.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No diagnosis records found
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Immunizations Tab */}
          <TabsContent value="immunizations">
            <div className="space-y-4">
              {immunizations.length > 0 ? (
                immunizations.map(immunization => (
                  <Card key={immunization.id} className="overflow-hidden bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50">
                    <CardHeader className="pb-2 bg-green-100/70 dark:bg-green-800/30">
                      <CardTitle className="text-lg">{immunization.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-green-600 dark:text-green-400">Date</p>
                          <p className="font-medium flex items-center gap-1 text-green-800 dark:text-green-200">
                            <Calendar className="h-3.5 w-3.5 text-green-500" />
                            {new Date(immunization.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-green-600 dark:text-green-400">Administered By</p>
                          <p className="font-medium text-green-800 dark:text-green-200">{immunization.administeredBy}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {immunization.lotNumber && (
                          <div>
                            <p className="text-green-600 dark:text-green-400">Lot Number</p>
                            <p className="font-medium text-green-800 dark:text-green-200">{immunization.lotNumber}</p>
                          </div>
                        )}
                        {immunization.nextDose && (
                          <div>
                            <p className="text-green-600 dark:text-green-400">Next Dose</p>
                            <p className="font-medium text-green-800 dark:text-green-200">{new Date(immunization.nextDose).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No immunization records found
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Medical Tests Tab */}
          <TabsContent value="tests">
            <div className="space-y-4">
              {medicalTests.length > 0 ? (
                medicalTests.map(test => (
                  <Card key={test.id} className="overflow-hidden bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/50">
                    <CardHeader className="pb-2 bg-amber-100/70 dark:bg-amber-800/30">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        {getTestStatusBadge(test.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-amber-600 dark:text-amber-400">Date</p>
                          <p className="font-medium flex items-center gap-1 text-amber-800 dark:text-amber-200">
                            <Calendar className="h-3.5 w-3.5 text-amber-500" />
                            {new Date(test.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-amber-600 dark:text-amber-400">Ordered By</p>
                          <p className="font-medium text-amber-800 dark:text-amber-200">{test.orderedBy}</p>
                        </div>
                      </div>
                      
                      {test.results && test.status === 'completed' && (
                        <div className="mt-3">
                          <p className="text-amber-600 dark:text-amber-400">Results</p>
                          <p className="mt-1 p-2 bg-amber-100/50 dark:bg-amber-900/40 rounded text-amber-800 dark:text-amber-200">{test.results}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No medical test records found
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DetailedHealthRecords;
