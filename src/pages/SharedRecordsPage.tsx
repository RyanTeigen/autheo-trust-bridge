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
import { Allergy, Calendar as CalendarIcon, ChartBar, Clock, Lock, Plus, Search, Share, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import DetailedHealthRecords from '@/components/records/DetailedHealthRecords';

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
  const [shareHealthDialog, setShareHealthDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('access');
  
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
  
  // Mock health record data
  const mockMedications = [
    {
      id: '1',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Daily',
      startDate: '2025-04-01',
      refillDate: '2025-06-01',
      prescribedBy: 'Dr. Emily Chen'
    },
    {
      id: '2',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily at bedtime',
      startDate: '2025-03-15',
      refillDate: '2025-05-20',
      prescribedBy: 'Dr. James Wilson'
    },
    {
      id: '3',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily with meals',
      startDate: '2025-02-10',
      refillDate: '2025-05-10',
      prescribedBy: 'Dr. Emily Chen'
    }
  ];
  
  const mockDiagnoses = [
    {
      id: '1',
      condition: 'Hypertension',
      diagnosedDate: '2024-10-15',
      diagnosedBy: 'Dr. Emily Chen',
      status: 'chronic' as const,
      notes: 'Well-controlled with current medication'
    },
    {
      id: '2',
      condition: 'Type 2 Diabetes',
      diagnosedDate: '2024-09-05',
      diagnosedBy: 'Dr. James Wilson',
      status: 'active' as const,
      notes: 'Currently managing with medication and lifestyle changes'
    },
    {
      id: '3',
      condition: 'Seasonal Allergies',
      diagnosedDate: '2023-04-20',
      diagnosedBy: 'Dr. Sarah Johnson',
      status: 'resolved' as const
    }
  ];
  
  const mockImmunizations = [
    {
      id: '1',
      name: 'COVID-19 Vaccine',
      date: '2025-01-15',
      administeredBy: 'City Hospital Clinic',
      lotNumber: 'CV19-45789',
      nextDose: '2025-07-15'
    },
    {
      id: '2',
      name: 'Influenza Vaccine',
      date: '2024-10-20',
      administeredBy: 'Neighborhood Pharmacy',
      lotNumber: 'FLU-78965'
    },
    {
      id: '3',
      name: 'Tetanus Booster',
      date: '2022-06-10',
      administeredBy: 'Dr. Emily Chen',
      lotNumber: 'TET-12345',
      nextDose: '2032-06-10'
    }
  ];
  
  const mockMedicalTests = [
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      date: '2025-04-15',
      orderedBy: 'Dr. Emily Chen',
      results: 'All values within normal range',
      status: 'completed' as const
    },
    {
      id: '2',
      name: 'Lipid Panel',
      date: '2025-04-15',
      orderedBy: 'Dr. Emily Chen',
      results: 'LDL slightly elevated, other values normal',
      status: 'completed' as const
    },
    {
      id: '3',
      name: 'Chest X-Ray',
      date: '2025-05-10',
      orderedBy: 'Dr. James Wilson',
      status: 'pending' as const
    }
  ];
  
  // Mock allergies data
  const mockAllergies = [
    {
      id: '1',
      name: 'Penicillin',
      severity: 'severe' as const,
      reaction: 'Hives, difficulty breathing',
      diagnosed: '2023-05-15'
    },
    {
      id: '2',
      name: 'Peanuts',
      severity: 'moderate' as const,
      reaction: 'Swelling, itchy throat',
      diagnosed: '2022-07-20'
    },
    {
      id: '3',
      name: 'Pollen',
      severity: 'mild' as const,
      reaction: 'Sneezing, watery eyes',
      diagnosed: '2021-04-10'
    }
  ];
  
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
      status: 'active' as const  // Explicitly typing as a literal to fix the issue
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
      record.id === id ? { ...record, status: 'expired' as const } : record
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
          Manage your health information and sharing preferences
        </p>
      </div>
      
      {/* Top-level tab system */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="access" className="px-6">Access Management</TabsTrigger>
          <TabsTrigger value="records" className="px-6">My Health Records</TabsTrigger>
        </TabsList>
        
        {/* Access Management Tab */}
        <TabsContent value="access" className="mt-0">
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
          
          <Tabs defaultValue="active" className="w-full mt-6">
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
        </TabsContent>
        
        {/* Health Records Tab */}
        <TabsContent value="records" className="mt-0">
          {/* Share Health Information Dialog */}
          <Dialog open={shareHealthDialog} onOpenChange={setShareHealthDialog}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Share Health Information</DialogTitle>
                <DialogDescription>
                  Share your health metrics, records, and allergies with your healthcare provider.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Select Healthcare Provider</h3>
                  <Select defaultValue="dr-chen">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dr-chen">Dr. Emily Chen</SelectItem>
                      <SelectItem value="dr-wilson">Dr. James Wilson</SelectItem>
                      <SelectItem value="city-hospital">City Hospital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Information to Share</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="metrics" defaultChecked />
                      <label htmlFor="metrics" className="text-sm flex items-center gap-1">
                        <ChartBar className="h-4 w-4" /> Health Metrics
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="allergies" defaultChecked />
                      <label htmlFor="allergies" className="text-sm flex items-center gap-1">
                        <Allergy className="h-4 w-4" /> Allergies
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="medications" defaultChecked />
                      <label htmlFor="medications" className="text-sm flex items-center gap-1">
                        <Pill className="h-4 w-4" /> Medications
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="diagnoses" defaultChecked />
                      <label htmlFor="diagnoses" className="text-sm flex items-center gap-1">
                        <FileX className="h-4 w-4" /> Diagnoses
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="immunizations" defaultChecked />
                      <label htmlFor="immunizations" className="text-sm flex items-center gap-1">
                        <Syringe className="h-4 w-4" /> Immunizations
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="tests" defaultChecked />
                      <label htmlFor="tests" className="text-sm flex items-center gap-1">
                        <TestTube className="h-4 w-4" /> Medical Tests
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Access Duration</h3>
                  <Select defaultValue="30d">
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="1y">1 year</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShareHealthDialog(false)}>Cancel</Button>
                <Button onClick={handleShareHealthInfo}>Share Information</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="flex justify-end mb-4">
            <Button 
              onClick={() => setShareHealthDialog(true)} 
              className="gap-1"
            >
              <Share className="h-4 w-4" />
              Share Health Information
            </Button>
          </div>
          
          <DetailedHealthRecords
            medications={mockMedications}
            diagnoses={mockDiagnoses}
            immunizations={mockImmunizations}
            medicalTests={mockMedicalTests}
            allergies={mockAllergies}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SharedRecordsPage;
