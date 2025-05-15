
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ClipboardCheck, FileText, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PatientDetailsProps {
  patientId: string;
}

// This would typically come from an API or database
const mockPatientData = {
  id: "P12345",
  name: "John Doe",
  dateOfBirth: "1980-05-15",
  gender: "Male",
  contactInfo: {
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, USA"
  },
  insurance: {
    provider: "HealthPlus Insurance",
    policyNumber: "HP987654321",
    group: "Group-A123"
  },
  allergies: ["Penicillin", "Peanuts"],
  conditions: ["Hypertension", "Type 2 Diabetes"],
  medications: [
    { name: "Lisinopril", dosage: "10mg", frequency: "Daily" },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily" }
  ],
  visits: [
    { date: "2025-04-15", provider: "Dr. Emily Chen", reason: "Annual Physical", notes: "Patient is doing well. Blood pressure is within normal range." },
    { date: "2024-11-20", provider: "Dr. James Wilson", reason: "Follow-up", notes: "Diabetes is well-controlled. Continue current medication." }
  ]
};

const PatientDetails: React.FC<PatientDetailsProps> = ({ patientId }) => {
  // In a real application, we would fetch patient data using the patientId
  const patient = mockPatientData;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div>
              <CardTitle>{patient.name}</CardTitle>
              <CardDescription>
                Patient ID: {patient.id}
              </CardDescription>
            </div>
            <div className="flex items-start gap-2">
              <Badge>{patient.gender}</Badge>
              <Badge variant="outline" className="flex gap-1 items-center">
                <CalendarIcon className="h-3 w-3" /> 
                {new Date(patient.dateOfBirth).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="visits">Visits</TabsTrigger>
              <TabsTrigger value="medications">Medications</TabsTrigger>
              <TabsTrigger value="conditions">Conditions</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Current Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {patient.medications.map((med, idx) => (
                        <li key={idx}>{med.name} {med.dosage}, {med.frequency}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {patient.conditions.map((condition, idx) => (
                        <li key={idx}>{condition}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.visits.slice(0, 2).map((visit, idx) => (
                    <div key={idx} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{visit.reason}</p>
                          <p className="text-sm text-muted-foreground">{visit.provider} - {new Date(visit.date).toLocaleDateString()}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7">
                          <FileText className="h-4 w-4 mr-1" /> Notes
                        </Button>
                      </div>
                      <p className="text-sm mt-1">{visit.notes}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="visits">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Visit History</CardTitle>
                  <Button size="sm">
                    <ClipboardCheck className="h-4 w-4 mr-1" /> New Visit
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patient.visits.map((visit, idx) => (
                      <div key={idx} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{visit.reason}</p>
                            <p className="text-sm text-muted-foreground">{visit.provider} - {new Date(visit.date).toLocaleDateString()}</p>
                          </div>
                          <Button variant="outline" size="sm" className="h-7">View Details</Button>
                        </div>
                        <p className="text-sm mt-2">{visit.notes}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="medications">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Current Medications</CardTitle>
                  <Button size="sm">
                    <ClipboardCheck className="h-4 w-4 mr-1" /> Add Medication
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patient.medications.map((med, idx) => (
                      <div key={idx} className="p-3 border rounded-md flex justify-between items-center">
                        <div>
                          <p className="font-medium">{med.name}</p>
                          <p className="text-sm">{med.dosage}, {med.frequency}</p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="conditions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Medical Conditions</CardTitle>
                  <Button size="sm">
                    <ClipboardCheck className="h-4 w-4 mr-1" /> Add Condition
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {patient.conditions.map((condition, idx) => (
                      <div key={idx} className="p-3 border rounded-md flex justify-between items-center">
                        <p className="font-medium">{condition}</p>
                        <Button variant="outline" size="sm">Details</Button>
                      </div>
                    ))}
                    
                    <div className="mt-4">
                      <h3 className="text-sm font-medium mb-2">Allergies</h3>
                      <div className="flex flex-wrap gap-2">
                        {patient.allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="destructive">{allergy}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="personal">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                  <Button size="sm" variant="outline">
                    <User className="h-4 w-4 mr-1" /> Edit
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <h3 className="font-medium mb-2">Contact Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Email:</span> {patient.contactInfo.email}</p>
                        <p><span className="text-muted-foreground">Phone:</span> {patient.contactInfo.phone}</p>
                        <p><span className="text-muted-foreground">Address:</span> {patient.contactInfo.address}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Insurance Information</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Provider:</span> {patient.insurance.provider}</p>
                        <p><span className="text-muted-foreground">Policy Number:</span> {patient.insurance.policyNumber}</p>
                        <p><span className="text-muted-foreground">Group:</span> {patient.insurance.group}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDetails;
