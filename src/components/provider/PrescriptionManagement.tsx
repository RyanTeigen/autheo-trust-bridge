import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Pill, 
  User, 
  Calendar, 
  RefreshCw, 
  MessageSquare,
  Check,
  X,
  Clock,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Patient {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
}

interface Prescription {
  id: string;
  patient_id: string;
  patient_name: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  start_date: string;
  end_date?: string;
  status: 'active' | 'completed' | 'discontinued';
  refills_remaining: number;
  total_refills: number;
  created_at: string;
}

interface RefillRequest {
  id: string;
  prescription_id: string;
  patient_name: string;
  medication_name: string;
  status: 'pending' | 'approved' | 'denied' | 'fulfilled';
  request_reason?: string;
  requested_at: string;
}

const PrescriptionManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('prescriptions');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [refillRequests, setRefillRequests] = useState<RefillRequest[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [showNewPrescriptionForm, setShowNewPrescriptionForm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // New prescription form state
  const [newPrescription, setNewPrescription] = useState({
    patient_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    instructions: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    total_refills: 0
  });

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockPrescriptions: Prescription[] = [
      {
        id: '1',
        patient_id: 'patient-1',
        patient_name: 'John Smith',
        medication_name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        instructions: 'Take with water in the evening',
        start_date: '2024-01-15',
        status: 'active',
        refills_remaining: 3,
        total_refills: 5,
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        patient_id: 'patient-2',
        patient_name: 'Sarah Johnson',
        medication_name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        instructions: 'Take with meals',
        start_date: '2024-01-20',
        status: 'active',
        refills_remaining: 1,
        total_refills: 3,
        created_at: '2024-01-20T14:30:00Z'
      }
    ];

    const mockRefillRequests: RefillRequest[] = [
      {
        id: '1',
        prescription_id: '1',
        patient_name: 'John Smith',
        medication_name: 'Lisinopril 10mg',
        status: 'pending',
        request_reason: 'Running low on medication',
        requested_at: '2024-01-25T09:15:00Z'
      },
      {
        id: '2',
        prescription_id: '2',
        patient_name: 'Sarah Johnson',
        medication_name: 'Metformin 500mg',
        status: 'pending',
        request_reason: 'Emergency refill needed',
        requested_at: '2024-01-26T16:20:00Z'
      }
    ];

    const mockPatients: Patient[] = [
      { id: 'patient-1', user_id: 'user-1', full_name: 'John Smith', email: 'john@example.com' },
      { id: 'patient-2', user_id: 'user-2', full_name: 'Sarah Johnson', email: 'sarah@example.com' },
      { id: 'patient-3', user_id: 'user-3', full_name: 'Mike Davis', email: 'mike@example.com' }
    ];

    setPrescriptions(mockPrescriptions);
    setRefillRequests(mockRefillRequests);
    setPatients(mockPatients);
  }, []);

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPrescription.patient_id || !newPrescription.medication_name || !newPrescription.dosage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      // TODO: Implement with real Supabase call
      const patient = patients.find(p => p.id === newPrescription.patient_id);
      
      const prescription: Prescription = {
        id: Date.now().toString(),
        patient_id: newPrescription.patient_id,
        patient_name: patient?.full_name || '',
        medication_name: newPrescription.medication_name,
        dosage: newPrescription.dosage,
        frequency: newPrescription.frequency,
        instructions: newPrescription.instructions,
        start_date: newPrescription.start_date,
        end_date: newPrescription.end_date || undefined,
        status: 'active',
        refills_remaining: newPrescription.total_refills,
        total_refills: newPrescription.total_refills,
        created_at: new Date().toISOString()
      };

      setPrescriptions(prev => [prescription, ...prev]);
      setShowNewPrescriptionForm(false);
      setNewPrescription({
        patient_id: '',
        medication_name: '',
        dosage: '',
        frequency: '',
        instructions: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        total_refills: 0
      });

      toast({
        title: "Prescription Created",
        description: `Prescription for ${prescription.medication_name} created successfully.`,
      });
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRefillResponse = async (requestId: string, action: 'approved' | 'denied') => {
    try {
      setRefillRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: action }
            : req
        )
      );

      const request = refillRequests.find(req => req.id === requestId);
      
      toast({
        title: `Refill Request ${action === 'approved' ? 'Approved' : 'Denied'}`,
        description: `${request?.medication_name} refill request for ${request?.patient_name} has been ${action}.`,
      });
    } catch (error) {
      console.error('Error responding to refill request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to refill request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription => 
    prescription.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medication_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRefillRequests = refillRequests.filter(req => req.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Prescription Management</h2>
          <p className="text-slate-400">Manage patient prescriptions and refill requests</p>
        </div>
        <Button 
          onClick={() => setShowNewPrescriptionForm(true)}
          className="bg-autheo-primary hover:bg-autheo-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Prescription
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="prescriptions">Active Prescriptions</TabsTrigger>
          <TabsTrigger value="refills">
            Refill Requests
            {pendingRefillRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {pendingRefillRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prescriptions" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Pill className="h-5 w-5 text-autheo-primary" />
                        <h3 className="text-lg font-semibold text-slate-100">
                          {prescription.medication_name} {prescription.dosage}
                        </h3>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          {prescription.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="h-4 w-4" />
                        <span>{prescription.patient_name}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Frequency:</span>
                          <p className="text-slate-200">{prescription.frequency}</p>
                        </div>
                        <div>
                          <span className="text-slate-400">Refills Remaining:</span>
                          <p className="text-slate-200">{prescription.refills_remaining}/{prescription.total_refills}</p>
                        </div>
                      </div>
                      
                      {prescription.instructions && (
                        <div className="text-sm">
                          <span className="text-slate-400">Instructions:</span>
                          <p className="text-slate-200">{prescription.instructions}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-slate-600 hover:bg-slate-700">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="refills" className="space-y-4">
          <div className="grid gap-4">
            {pendingRefillRequests.map((request) => (
              <Card key={request.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-5 w-5 text-autheo-primary" />
                        <h3 className="text-lg font-semibold text-slate-100">
                          {request.medication_name}
                        </h3>
                        <Badge variant="outline" className="text-amber-400 border-amber-400">
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="h-4 w-4" />
                        <span>{request.patient_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>Requested {new Date(request.requested_at).toLocaleDateString()}</span>
                      </div>
                      
                      {request.request_reason && (
                        <div className="text-sm">
                          <span className="text-slate-400">Reason:</span>
                          <p className="text-slate-200">{request.request_reason}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleRefillResponse(request.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRefillResponse(request.id, 'denied')}
                        className="border-red-600 text-red-400 hover:bg-red-600/10"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Deny
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {pendingRefillRequests.length === 0 && (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                  <h3 className="text-lg font-medium text-slate-400 mb-2">No Pending Refill Requests</h3>
                  <p className="text-slate-500">All refill requests have been processed.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Prescription Form Modal */}
      {showNewPrescriptionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-slate-100">Create New Prescription</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreatePrescription} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient" className="text-slate-200">Patient *</Label>
                    <Select 
                      value={newPrescription.patient_id} 
                      onValueChange={(value) => setNewPrescription(prev => ({ ...prev, patient_id: value }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="medication_name" className="text-slate-200">Medication Name *</Label>
                    <Input
                      id="medication_name"
                      value={newPrescription.medication_name}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, medication_name: e.target.value }))}
                      className="bg-slate-700 border-slate-600"
                      placeholder="e.g., Lisinopril"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dosage" className="text-slate-200">Dosage *</Label>
                    <Input
                      id="dosage"
                      value={newPrescription.dosage}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                      className="bg-slate-700 border-slate-600"
                      placeholder="e.g., 10mg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="frequency" className="text-slate-200">Frequency *</Label>
                    <Select 
                      value={newPrescription.frequency} 
                      onValueChange={(value) => setNewPrescription(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="Four times daily">Four times daily</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="start_date" className="text-slate-200">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={newPrescription.start_date}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, start_date: e.target.value }))}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="total_refills" className="text-slate-200">Total Refills</Label>
                    <Input
                      id="total_refills"
                      type="number"
                      min="0"
                      max="12"
                      value={newPrescription.total_refills}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, total_refills: parseInt(e.target.value) || 0 }))}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="instructions" className="text-slate-200">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                    className="bg-slate-700 border-slate-600"
                    placeholder="Special instructions for the patient..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-autheo-primary hover:bg-autheo-primary/90">
                    Create Prescription
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowNewPrescriptionForm(false)}
                    className="flex-1 border-slate-600 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PrescriptionManagement;