
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Edit, Trash2, Stethoscope, UserCheck, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Provider {
  id: string;
  name: string;
  email: string;
  specialty: string;
  licenseNumber: string;
  npi: string;
  status: 'active' | 'pending' | 'suspended';
  patientsCount: number;
  lastActivity: string;
  verified: boolean;
}

const ProviderManagementTab: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddProviderOpen, setIsAddProviderOpen] = useState(false);

  // Mock provider data
  const providers: Provider[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@hospital.com',
      specialty: 'Cardiology',
      licenseNumber: 'MD123456',
      npi: '1234567890',
      status: 'active',
      patientsCount: 142,
      lastActivity: '2 hours ago',
      verified: true
    },
    {
      id: '2',
      name: 'Dr. Michael Brown',
      email: 'michael.brown@hospital.com',
      specialty: 'Pediatrics',
      licenseNumber: 'MD789012',
      npi: '0987654321',
      status: 'active',
      patientsCount: 89,
      lastActivity: '1 day ago',
      verified: true
    },
    {
      id: '3',
      name: 'Dr. Emily Wilson',
      email: 'emily.wilson@hospital.com',
      specialty: 'Emergency Medicine',
      licenseNumber: 'MD345678',
      npi: '1122334455',
      status: 'pending',
      patientsCount: 0,
      lastActivity: 'Never',
      verified: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddProvider = () => {
    toast({
      title: "Provider Added",
      description: "New provider has been added to the system for verification.",
    });
    setIsAddProviderOpen(false);
  };

  const handleVerifyProvider = (providerId: string) => {
    toast({
      title: "Provider Verified",
      description: "Provider credentials have been verified and approved.",
    });
  };

  const handleSuspendProvider = (providerId: string) => {
    toast({
      title: "Provider Suspended",
      description: "Provider access has been temporarily suspended.",
      variant: "destructive",
    });
  };

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Provider Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Add Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search providers by name, email, or specialty..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={isAddProviderOpen} onOpenChange={setIsAddProviderOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Healthcare Provider</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="providerName">Full Name</Label>
                      <Input id="providerName" placeholder="Dr. Jane Smith" />
                    </div>
                    <div>
                      <Label htmlFor="providerEmail">Email</Label>
                      <Input id="providerEmail" type="email" placeholder="jane.smith@hospital.com" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="specialty">Specialty</Label>
                      <Input id="specialty" placeholder="Cardiology" />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input id="licenseNumber" placeholder="MD123456" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="npi">NPI Number</Label>
                      <Input id="npi" placeholder="1234567890" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="(555) 123-4567" />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea id="notes" placeholder="Any additional information about the provider..." />
                  </div>
                  
                  <Button onClick={handleAddProvider} className="w-full">
                    Add Provider for Verification
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Providers Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>License #</TableHead>
                  <TableHead>NPI</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{provider.name}</span>
                        {provider.verified && (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        )}
                        {!provider.verified && (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{provider.email}</div>
                    </TableCell>
                    <TableCell>{provider.specialty}</TableCell>
                    <TableCell className="font-mono text-sm">{provider.licenseNumber}</TableCell>
                    <TableCell className="font-mono text-sm">{provider.npi}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(provider.status)}>
                        {provider.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{provider.patientsCount}</TableCell>
                    <TableCell>{provider.lastActivity}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {provider.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyProvider(provider.id)}
                          >
                            <UserCheck className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspendProvider(provider.id)}
                        >
                          <AlertCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProviders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No providers found matching your search criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderManagementTab;
