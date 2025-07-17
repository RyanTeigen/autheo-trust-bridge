import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Building2, CheckCircle, AlertTriangle, XCircle, Plus, Search, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Hospital {
  id: string;
  hospital_id: string;
  hospital_name: string;
  address: string;
  contact_email: string;
  contact_phone: string;
  verification_status: string;
  verified_at: string;
  certification_data: any;
  api_endpoint: string;
  public_key: string;
  created_at: string;
  updated_at: string;
}

const HospitalRegistry: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddingHospital, setIsAddingHospital] = useState(false);
  const [newHospital, setNewHospital] = useState({
    hospital_id: '',
    hospital_name: '',
    address: '',
    contact_email: '',
    contact_phone: '',
    api_endpoint: '',
    certification_data: '{}'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const { data, error } = await supabase
        .from('hospital_registry')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHospitals(data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
      toast({
        title: "Error",
        description: "Failed to load hospital registry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHospital = async () => {
    try {
      if (!newHospital.hospital_id || !newHospital.hospital_name || !newHospital.contact_email) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('hospital_registry')
        .insert({
          ...newHospital,
          certification_data: newHospital.certification_data ? JSON.parse(newHospital.certification_data) : {}
        })
        .select()
        .single();

      if (error) throw error;

      setHospitals(prev => [data, ...prev]);
      setNewHospital({
        hospital_id: '',
        hospital_name: '',
        address: '',
        contact_email: '',
        contact_phone: '',
        api_endpoint: '',
        certification_data: '{}'
      });
      setIsAddingHospital(false);

      toast({
        title: "Hospital Added",
        description: "Hospital has been added to the registry for verification",
      });
    } catch (error) {
      console.error('Error adding hospital:', error);
      toast({
        title: "Error",
        description: "Failed to add hospital to registry",
        variant: "destructive",
      });
    }
  };

  const handleStatusUpdate = async (hospitalId: string, newStatus: string) => {
    try {
      const updateData: any = {
        verification_status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'verified') {
        updateData.verified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('hospital_registry')
        .update(updateData)
        .eq('id', hospitalId);

      if (error) throw error;

      setHospitals(prev => prev.map(h => 
        h.id === hospitalId 
          ? { ...h, verification_status: newStatus, verified_at: newStatus === 'verified' ? new Date().toISOString() : h.verified_at }
          : h
      ));

      toast({
        title: "Status Updated",
        description: `Hospital verification status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating hospital status:', error);
      toast({
        title: "Error",
        description: "Failed to update hospital status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      verified: { color: 'bg-green-600', icon: CheckCircle, label: 'Verified' },
      pending: { color: 'bg-yellow-600', icon: AlertTriangle, label: 'Pending' },
      rejected: { color: 'bg-red-600', icon: XCircle, label: 'Rejected' },
      suspended: { color: 'bg-gray-600', icon: XCircle, label: 'Suspended' }
    };
    const config = configs[status as keyof typeof configs] || configs.pending;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} text-white flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.hospital_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hospital.verification_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-autheo-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-autheo-primary" />
          Hospital Registry Management
        </CardTitle>
        <CardDescription>
          Manage and verify healthcare institutions for cross-hospital data sharing
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search hospitals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isAddingHospital} onOpenChange={setIsAddingHospital}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Hospital
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Hospital</DialogTitle>
                <DialogDescription>
                  Register a new healthcare institution in the network
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hospital_id">Hospital ID *</Label>
                    <Input
                      id="hospital_id"
                      value={newHospital.hospital_id}
                      onChange={(e) => setNewHospital(prev => ({ ...prev, hospital_id: e.target.value }))}
                      placeholder="e.g., ST-MARY-001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hospital_name">Hospital Name *</Label>
                    <Input
                      id="hospital_name"
                      value={newHospital.hospital_name}
                      onChange={(e) => setNewHospital(prev => ({ ...prev, hospital_name: e.target.value }))}
                      placeholder="St. Mary Medical Center"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newHospital.address}
                    onChange={(e) => setNewHospital(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Healthcare Ave, Medical City, MC 12345"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={newHospital.contact_email}
                      onChange={(e) => setNewHospital(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="contact@hospital.health"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      value={newHospital.contact_phone}
                      onChange={(e) => setNewHospital(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="api_endpoint">API Endpoint</Label>
                  <Input
                    id="api_endpoint"
                    value={newHospital.api_endpoint}
                    onChange={(e) => setNewHospital(prev => ({ ...prev, api_endpoint: e.target.value }))}
                    placeholder="https://api.hospital.health/v1"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddHospital} className="flex-1">
                    Add Hospital
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingHospital(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hospitals List */}
        <div className="space-y-4">
          {filteredHospitals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm || statusFilter !== 'all' ? 'No hospitals match your filters' : 'No hospitals registered yet'}
            </p>
          ) : (
            filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className="border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{hospital.hospital_name}</h3>
                        {getStatusBadge(hospital.verification_status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <p><strong>ID:</strong> {hospital.hospital_id}</p>
                        <p><strong>Email:</strong> {hospital.contact_email}</p>
                        {hospital.address && <p><strong>Address:</strong> {hospital.address}</p>}
                        {hospital.contact_phone && <p><strong>Phone:</strong> {hospital.contact_phone}</p>}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        <p>Registered: {new Date(hospital.created_at).toLocaleDateString()}</p>
                        {hospital.verified_at && (
                          <p>Verified: {new Date(hospital.verified_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {hospital.verification_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(hospital.id, 'verified')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(hospital.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {hospital.verification_status === 'verified' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(hospital.id, 'suspended')}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Suspend
                        </Button>
                      )}
                      
                      {hospital.verification_status === 'suspended' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(hospital.id, 'verified')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {hospital.api_endpoint && (
                    <Alert className="mt-4 border-blue-200 bg-blue-50">
                      <Shield className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>API Endpoint:</strong> {hospital.api_endpoint}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalRegistry;