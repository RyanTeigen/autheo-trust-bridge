
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, UserPlus, FileText, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Provider {
  id: string;
  name: string;
  role: string;
  accessLevel: string;
  grantedOn: string;
  expiresOn?: string;
  dataCategories: string[];
}

interface ApprovedAccessProps {
  providers: Provider[];
}

const ApprovedAccess: React.FC<ApprovedAccessProps> = ({ providers: initialProviders }) => {
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const { toast } = useToast();

  const handleAddProvider = () => {
    // In a real app, this would validate and save to the blockchain
    const newProvider: Provider = {
      id: `provider-${providers.length + 1}`,
      name: "Dr. New Provider",
      role: "Specialist",
      accessLevel: "Limited",
      grantedOn: new Date().toISOString(),
      expiresOn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      dataCategories: ["Medications", "Labs"]
    };
    
    setProviders([...providers, newProvider]);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Provider Added",
      description: "Access permissions have been granted to the new provider",
    });
  };
  
  const handleRevokeAccess = (providerId: string) => {
    setProviders(providers.filter(provider => provider.id !== providerId));
    setIsManageDialogOpen(false);
    
    toast({
      title: "Access Revoked",
      description: "Provider access has been successfully revoked",
    });
  };
  
  const handleManageProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsManageDialogOpen(true);
  };

  return (
    <>
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Approved Access</CardTitle>
            <CardDescription>
              Providers with access to your records
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" /> Grant Access
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {providers.map((provider) => (
              <div key={provider.id} className="p-3 border rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{provider.name}</p>
                    <p className="text-sm text-muted-foreground">{provider.role} - {provider.accessLevel} Access</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleManageProvider(provider)}>Manage</Button>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {provider.dataCategories.map((category, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{category}</Badge>
                  ))}
                </div>
                
                <div className="flex items-center text-xs text-muted-foreground mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {provider.expiresOn ? (
                    <span>Expires: {new Date(provider.expiresOn).toLocaleDateString()}</span>
                  ) : (
                    <span>No expiration set</span>
                  )}
                </div>
              </div>
            ))}
            
            {providers.length === 0 && (
              <div className="text-center p-4 border border-dashed rounded-md">
                <p className="text-muted-foreground">No providers have access to your records</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Access is cryptographically enforced and recorded on the blockchain
        </CardFooter>
      </Card>
      
      {/* Add Provider Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Provider Access</DialogTitle>
            <DialogDescription>
              Give a healthcare provider access to specific parts of your medical record
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Provider Name</label>
              <Input placeholder="Enter provider name" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Level</label>
              <Select defaultValue="limited">
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Access</SelectItem>
                  <SelectItem value="limited">Limited Access</SelectItem>
                  <SelectItem value="emergency">Emergency Access Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiration</label>
              <Select defaultValue="90days">
                <SelectTrigger>
                  <SelectValue placeholder="Select expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">30 Days</SelectItem>
                  <SelectItem value="90days">90 Days</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="never">No Expiration</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Categories</label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="medications" defaultChecked />
                  <label htmlFor="medications" className="text-sm">Medications</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="allergies" defaultChecked />
                  <label htmlFor="allergies" className="text-sm">Allergies</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="conditions" defaultChecked />
                  <label htmlFor="conditions" className="text-sm">Conditions</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="labs" defaultChecked />
                  <label htmlFor="labs" className="text-sm">Lab Results</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="imaging" />
                  <label htmlFor="imaging" className="text-sm">Imaging</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="notes" />
                  <label htmlFor="notes" className="text-sm">Provider Notes</label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddProvider}>Grant Access</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Manage Provider Dialog */}
      {selectedProvider && (
        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Provider Access</DialogTitle>
              <DialogDescription>
                Update or revoke access for {selectedProvider.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{selectedProvider.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProvider.role}</p>
                </div>
                <Badge>{selectedProvider.accessLevel}</Badge>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Granted on: {new Date(selectedProvider.grantedOn).toLocaleDateString()}</span>
                </div>
                {selectedProvider.expiresOn && (
                  <div className="text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Expires on: {new Date(selectedProvider.expiresOn).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Access to:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedProvider.dataCategories.map((category, i) => (
                    <Badge key={i} variant="secondary">{category}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Change Expiration:</div>
                <Select defaultValue={selectedProvider.expiresOn ? '90days' : 'never'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">30 Days</SelectItem>
                    <SelectItem value="90days">90 Days</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="never">No Expiration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter className="flex items-center justify-between">
              <Button 
                variant="destructive" 
                onClick={() => handleRevokeAccess(selectedProvider.id)}
              >
                Revoke Access
              </Button>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setIsManageDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "Access Updated",
                    description: `Updated permissions for ${selectedProvider.name}`,
                  });
                  setIsManageDialogOpen(false);
                }}>Save Changes</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ApprovedAccess;
