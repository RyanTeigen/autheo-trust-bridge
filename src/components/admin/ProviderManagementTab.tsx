
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Stethoscope, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProviderTable from './provider-management/ProviderTable';
import AddProviderDialog from './provider-management/AddProviderDialog';

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
            
            <AddProviderDialog
              isOpen={isAddProviderOpen}
              onOpenChange={setIsAddProviderOpen}
              onAddProvider={handleAddProvider}
            />
          </div>

          <ProviderTable
            providers={filteredProviders}
            onVerifyProvider={handleVerifyProvider}
            onSuspendProvider={handleSuspendProvider}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderManagementTab;
