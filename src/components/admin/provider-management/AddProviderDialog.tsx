
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';

interface AddProviderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProvider: () => void;
}

const AddProviderDialog: React.FC<AddProviderDialogProps> = ({
  isOpen,
  onOpenChange,
  onAddProvider
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          
          <Button onClick={onAddProvider} className="w-full">
            Add Provider for Verification
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddProviderDialog;
