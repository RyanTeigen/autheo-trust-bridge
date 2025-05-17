
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pills, FileX, Syringe, TestTube, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
}

const DetailedHealthRecords: React.FC<DetailedHealthRecordsProps> = ({ 
  medications,
  diagnoses,
  immunizations,
  medicalTests
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
      return <Badge variant="warning" className="bg-amber-100 text-amber-800">Refill Soon</Badge>;
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
    <Card>
      <CardHeader>
        <CardTitle>My Health Records</CardTitle>
        <CardDescription>
          View your medications, diagnoses, immunizations, and medical tests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="medications" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="medications" className="flex items-center gap-1">
              <Pills className="h-4 w-4" /> Medications
            </TabsTrigger>
            <TabsTrigger value="diagnoses" className="flex items-center gap-1">
              <FileX className="h-4 w-4" /> Diagnoses
            </TabsTrigger>
            <TabsTrigger value="immunizations" className="flex items-center gap-1">
              <Syringe className="h-4 w-4" /> Immunizations
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center gap-1">
              <TestTube className="h-4 w-4" /> Medical Tests
            </TabsTrigger>
          </TabsList>
          
          {/* Medications Tab */}
          <TabsContent value="medications">
            <div className="space-y-4">
              {medications.length > 0 ? (
                medications.map(med => (
                  <Card key={med.id} className="overflow-hidden">
                    <CardHeader className="pb-2 bg-slate-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{med.name}</CardTitle>
                          <CardDescription>{med.dosage}, {med.frequency}</CardDescription>
                        </div>
                        {getRefillStatusBadge(med.refillDate)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Started</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(med.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Refill Due</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(med.refillDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
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
                  <Card key={diagnosis.id} className="overflow-hidden">
                    <CardHeader className="pb-2 bg-slate-50">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{diagnosis.condition}</CardTitle>
                        {getDiagnosisStatusBadge(diagnosis.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-muted-foreground">Diagnosed</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(diagnosis.diagnosedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Diagnosed By</p>
                          <p className="font-medium">{diagnosis.diagnosedBy}</p>
                        </div>
                      </div>
                      {diagnosis.notes && (
                        <div className="mt-2">
                          <p className="text-muted-foreground">Notes</p>
                          <p className="mt-1 p-2 bg-slate-50 rounded">{diagnosis.notes}</p>
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
                  <Card key={immunization.id} className="overflow-hidden">
                    <CardHeader className="pb-2 bg-slate-50">
                      <CardTitle className="text-lg">{immunization.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(immunization.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Administered By</p>
                          <p className="font-medium">{immunization.administeredBy}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {immunization.lotNumber && (
                          <div>
                            <p className="text-muted-foreground">Lot Number</p>
                            <p className="font-medium">{immunization.lotNumber}</p>
                          </div>
                        )}
                        {immunization.nextDose && (
                          <div>
                            <p className="text-muted-foreground">Next Dose</p>
                            <p className="font-medium">{new Date(immunization.nextDose).toLocaleDateString()}</p>
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
                  <Card key={test.id} className="overflow-hidden">
                    <CardHeader className="pb-2 bg-slate-50">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                        {getTestStatusBadge(test.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(test.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Ordered By</p>
                          <p className="font-medium">{test.orderedBy}</p>
                        </div>
                      </div>
                      
                      {test.results && test.status === 'completed' && (
                        <div className="mt-3">
                          <p className="text-muted-foreground">Results</p>
                          <p className="mt-1 p-2 bg-slate-50 rounded">{test.results}</p>
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
