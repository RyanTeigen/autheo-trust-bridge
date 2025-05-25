
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, UserCheck, AlertCircle } from 'lucide-react';

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

interface ProviderTableProps {
  providers: Provider[];
  onVerifyProvider: (providerId: string) => void;
  onSuspendProvider: (providerId: string) => void;
}

const ProviderTable: React.FC<ProviderTableProps> = ({
  providers,
  onVerifyProvider,
  onSuspendProvider
}) => {
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

  if (providers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No providers found matching your search criteria.
      </div>
    );
  }

  return (
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
          {providers.map((provider) => (
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
                      onClick={() => onVerifyProvider(provider.id)}
                    >
                      <UserCheck className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSuspendProvider(provider.id)}
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
  );
};

export default ProviderTable;
