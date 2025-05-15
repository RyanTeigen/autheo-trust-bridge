
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Calendar as CalendarIcon, Clock, Lock, Plus, Search, Share, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Types for the shared records
interface SharedRecord {
  id: string;
  recipientName: string;
  recipientType: 'provider' | 'organization' | 'caregiver';
  sharedDate: string;
  expiryDate: string;
  accessLevel: 'full' | 'limited' | 'read-only';
  status: 'active' | 'pending' | 'expired';
}

// Types for the form
interface ShareFormValues {
  recipientName: string;
  recipientType: 'provider' | 'organization' | 'caregiver';
  expiryDate?: Date;
  accessLevel: 'full' | 'limited' | 'read-only';
  recordTypes: string[];
}

const SharedRecordsPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Mock data for shared records
  const [sharedRecords, setSharedRecords] = useState<SharedRecord[]>([
    {
      id: '1',
      recipientName: 'Dr. Emily Chen',
      recipientType: 'provider',
      sharedDate: '2025-03-01',
      expiryDate: '2025-06-01',
      accessLevel: 'full',
      status: 'active'
    },
    {
      id: '2',
      recipientName: 'City Hospital',
      recipientType: 'organization',
      sharedDate: '2025-02-15',
      expiryDate: '2026-02-15',
      accessLevel: 'limited',
      status: 'active'
    },
    {
      id: '3',
      recipientName: 'Sarah Johnson (Mom)',
      recipientType: 'caregiver',
      sharedDate: '2025-01-10',
      expiryDate: '2025-04-10',
      accessLevel: 'read-only',
      status: 'expired'
    }
  ]);
  
  // Filtered records based on search query
  const filteredRecords = sharedRecords.filter(record => 
    record.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.recipientType.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Split records by status
  const activeRecords = filteredRecords.filter(record => record.status === 'active');
  const pendingRecords = filteredRecords.filter(record => record.status === 'pending');
  const expiredRecords = filteredRecords.filter(record => record.status === 'expired');
  
  // Form for sharing new records
  const form = useForm<ShareFormValues>({
    defaultValues: {
      recipientName: '',
      recipientType: 'provider',
      accessLevel: 'limited',
      recordTypes: ['medications', 'conditions']
    }
  });
  
  const handleSubmit = (values: ShareFormValues) => {
    // Create a new shared record
    const newRecord: SharedRecord = {
      id: (sharedRecords.length + 1).toString(),
      recipientName: values.recipientName,
      recipientType: values.recipientType,
      sharedDate: new Date().toISOString().slice(0, 10),
      expiryDate: values.expiryDate ? values.expiryDate.toISOString().slice(0, 10) : '',
      accessLevel: values.accessLevel,
      status: 'active'
    };
    
    // Add the new record to the list
    setSharedRecords([...sharedRecords, newRecord]);
    
    // Close dialog and show toast
    setDialogOpen(false);
    form.reset();
    
    toast({
      title: "Records shared successfully",
      description: `${values.recipientName} now has ${values.accessLevel} access to your records.`,
    });
  };
  
  const handleRevokeAccess = (id: string) => {
    // Update the status of the record to expired
    const updatedRecords = sharedRecords.map(record => 
      record.id === id ? { ...record, status: 'expired' } : record
    );
    
    setSharedRecords(updatedRecords);
    
    toast({
      title: "Access revoked",
      description: "The recipient's access to your records has been revoked.",
    });
  };
  
  // Function to get badge color based on access level
  const getAccessLevelBadge = (level: string) => {
    switch (level) {
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'limited':
        return 'bg-amber-100 text-amber-800';
      case 'read-only':
        return 'bg-green-100 text-green-800';
      default:
        return '';
    }
  };
  
  // Function to render record cards
  const renderRecordCard = (record: SharedRecord) => (
    <Card key={record.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{record.recipientName}</CardTitle>
            <CardDescription>
              {record.recipientType.charAt(0).toUpperCase() + record.recipientType.slice(1)}
            </CardDescription>
          </div>
          <Badge variant="outline" className={getAccessLevelBadge(record.accessLevel)}>
            {record.accessLevel.charAt(0).toUpperCase() + record.accessLevel.slice(1)} Access
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex items-center gap-2">
            <Share className="h-4 w-4 text-muted-foreground" />
            <span>Shared on {new Date(record.sharedDate).toLocaleDateString()}</span>
          </div>
          {record.expiryDate && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Expires on {new Date(record.expiryDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          {record.status === 'active' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-600" 
              onClick={() => handleRevokeAccess(record.id)}
            >
              <Lock className="h-4 w-4 mr-1" />
              Revoke Access
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Shared Records</h1>
        <p className="text-muted-foreground">
          Manage who has access to your health information
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search shared records..." 
            className="pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-1" />
              Share New Records
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Share Health Records</DialogTitle>
              <DialogDescription>
                Grant access to your health records to a healthcare provider, organization, or personal caregiver.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="recipientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Dr. John Smith" {...field} required />
                      </FormControl>
                      <FormDescription>
                        Enter the name of the person or organization
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="recipientType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipient type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="provider">Healthcare Provider</SelectItem>
                          <SelectItem value="organization">Healthcare Organization</SelectItem>
                          <SelectItem value="caregiver">Personal Caregiver</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Access Expiry Date (Optional)</FormLabel>
                      <div className="flex items-center gap-2 border rounded-md p-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <div className={cn(
                          "text-sm",
                          !field.value && "text-muted-foreground"
                        )}>
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            "Pick a date"
                          )}
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                      <FormDescription>
                        Leave blank for indefinite access
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accessLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Access Level</FormLabel>
                      <FormControl>
                        <ToggleGroup 
                          type="single" 
                          value={field.value}
                          onValueChange={(value) => {
                            if (value) field.onChange(value);
                          }}
                          className="justify-start"
                        >
                          <ToggleGroupItem value="read-only">Read Only</ToggleGroupItem>
                          <ToggleGroupItem value="limited">Limited</ToggleGroupItem>
                          <ToggleGroupItem value="full">Full Access</ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormDescription>
                        Control how much information is shared
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="recordTypes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Record Types to Share</FormLabel>
                      <FormControl>
                        <ToggleGroup 
                          type="multiple" 
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex flex-wrap justify-start"
                        >
                          <ToggleGroupItem value="medications">Medications</ToggleGroupItem>
                          <ToggleGroupItem value="conditions">Conditions</ToggleGroupItem>
                          <ToggleGroupItem value="labs">Lab Results</ToggleGroupItem>
                          <ToggleGroupItem value="imaging">Imaging</ToggleGroupItem>
                          <ToggleGroupItem value="notes">Doctor Notes</ToggleGroupItem>
                        </ToggleGroup>
                      </FormControl>
                      <FormDescription>
                        Select which types of records to share
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Share Records</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="active">
            Active
            {activeRecords.length > 0 && (
              <Badge variant="secondary" className="ml-2">{activeRecords.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pendingRecords.length > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingRecords.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired
            {expiredRecords.length > 0 && (
              <Badge variant="secondary" className="ml-2">{expiredRecords.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-6">
          {activeRecords.length > 0 ? (
            activeRecords.map(renderRecordCard)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  No active shared records found
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Use the "Share New Records" button to start sharing your health information
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(true)}
                >
                  Share New Records
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          {pendingRecords.length > 0 ? (
            pendingRecords.map(renderRecordCard)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No pending shared records
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="expired" className="mt-6">
          {expiredRecords.length > 0 ? (
            expiredRecords.map(renderRecordCard)
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <Lock className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No expired shared records
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedRecordsPage;
