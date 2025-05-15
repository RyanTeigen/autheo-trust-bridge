
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CalendarIcon, FileText } from 'lucide-react';

export interface PatientRecordProps {
  id?: string;
  patientName?: string;
}

// Mock data for this component
const mockRecordData = {
  medications: [
    { name: "Lisinopril", dosage: "10mg", frequency: "Daily" },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily" }
  ],
  allergies: ["Penicillin", "Peanuts"],
  encounters: [
    { date: "2025-04-15", provider: "Dr. Emily Chen", type: "Office Visit", notes: "Patient is stable." },
    { date: "2025-02-10", provider: "Dr. James Wilson", type: "Follow-up", notes: "Medication adjustment." }
  ],
  orders: [
    { date: "2025-04-15", name: "Complete Blood Count", status: "Completed", result: "Normal" },
    { date: "2025-04-15", name: "Chest X-Ray", status: "Ordered", result: "Pending" }
  ]
};

const PatientRecord: React.FC<PatientRecordProps> = ({ 
  id = "new", 
  patientName = "New Patient" 
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{patientName}</CardTitle>
        <CardDescription>
          Patient ID: {id}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="encounters">Encounters</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mockRecordData.medications.length > 0 ? (
                      <ul className="space-y-2">
                        {mockRecordData.medications.map((med, idx) => (
                          <li key={idx} className="p-2 bg-muted/50 rounded-sm">
                            <div className="font-medium">{med.name}</div>
                            <div className="text-sm">{med.dosage}, {med.frequency}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No current medications
                      </p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Allergies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mockRecordData.allergies.length > 0 ? (
                      <ul className="space-y-2">
                        {mockRecordData.allergies.map((allergy, idx) => (
                          <li key={idx} className="p-2 bg-red-100 text-red-800 rounded-sm">
                            {allergy}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No known allergies
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Recent Encounters</CardTitle>
                </CardHeader>
                <CardContent>
                  {mockRecordData.encounters.length > 0 ? (
                    <div className="space-y-3">
                      {mockRecordData.encounters.slice(0, 3).map((encounter, idx) => (
                        <div key={idx} className="flex justify-between items-start border-b pb-3 last:border-0">
                          <div>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{new Date(encounter.date).toLocaleDateString()}</span>
                            </div>
                            <p className="font-medium mt-1">{encounter.type}</p>
                            <p className="text-sm text-muted-foreground">{encounter.provider}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-1" /> 
                            Notes
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No recent encounters
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="records" className="mt-0">
            <div className="space-y-4">
              <p className="text-sm">
                Medical records, test results, and documents will be displayed here.
              </p>
              <Button>Upload New Record</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="encounters" className="mt-0">
            <div className="space-y-4">
              {mockRecordData.encounters.length > 0 ? (
                <div className="space-y-4">
                  {mockRecordData.encounters.map((encounter, idx) => (
                    <Card key={idx}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{encounter.type}</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {new Date(encounter.date).toLocaleDateString()}
                          </div>
                        </div>
                        <CardDescription>{encounter.provider}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p>{encounter.notes}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No encounters recorded
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-0">
            <div className="space-y-4">
              {mockRecordData.orders.length > 0 ? (
                <div className="space-y-3">
                  {mockRecordData.orders.map((order, idx) => (
                    <div key={idx} className="p-3 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{order.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Ordered on: {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm px-2 py-0.5 rounded-full ${
                            order.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                      {order.result && (
                        <p className="text-sm mt-2">
                          Result: <span className="font-medium">{order.result}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No orders placed
                </p>
              )}
              <Button>New Order</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PatientRecord;
