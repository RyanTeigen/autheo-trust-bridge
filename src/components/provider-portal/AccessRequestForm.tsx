
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const accessRequestSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  patientMRN: z.string().min(1, 'Patient MRN is required'),
  requestType: z.string().min(1, 'Request type is required'),
  urgency: z.string().min(1, 'Urgency level is required'),
  reason: z.string().min(10, 'Please provide a detailed reason (minimum 10 characters)'),
  requestedData: z.string().min(1, 'Please specify what data you need access to'),
  expectedDuration: z.string().min(1, 'Expected access duration is required'),
});

type AccessRequestFormValues = z.infer<typeof accessRequestSchema>;

interface AccessRequest {
  id: string;
  patientName: string;
  requestType: string;
  status: 'pending' | 'approved' | 'denied';
  submittedAt: string;
  urgency: string;
}

const AccessRequestForm: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentRequests, setRecentRequests] = useState<AccessRequest[]>([
    {
      id: '1',
      patientName: 'John Doe',
      requestType: 'Lab Results',
      status: 'pending',
      submittedAt: '2025-01-20T10:30:00Z',
      urgency: 'high'
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      requestType: 'Full Medical History',
      status: 'approved',
      submittedAt: '2025-01-19T14:15:00Z',
      urgency: 'normal'
    },
    {
      id: '3',
      patientName: 'Robert Johnson',
      requestType: 'Imaging Results',
      status: 'denied',
      submittedAt: '2025-01-18T09:45:00Z',
      urgency: 'low'
    }
  ]);

  const form = useForm<AccessRequestFormValues>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      patientName: '',
      patientMRN: '',
      requestType: '',
      urgency: '',
      reason: '',
      requestedData: '',
      expectedDuration: '',
    },
  });

  const onSubmit = async (values: AccessRequestFormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to recent requests
      const newRequest: AccessRequest = {
        id: Date.now().toString(),
        patientName: values.patientName,
        requestType: values.requestType,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        urgency: values.urgency
      };
      
      setRecentRequests(prev => [newRequest, ...prev]);
      
      toast({
        title: "Access Request Submitted",
        description: `Your request for ${values.patientName}'s ${values.requestType} has been submitted for review.`,
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit access request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30';
      case 'approved':
        return 'bg-green-900/20 text-green-400 border-green-700/30';
      case 'denied':
        return 'bg-red-900/20 text-red-400 border-red-700/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-slate-100">Submit New Request</CardTitle>
            <CardDescription className="text-slate-400">
              Request access to specific patient records or information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Patient Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter patient name" 
                            {...field}
                            className="bg-slate-600 border-slate-500 text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="patientMRN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Patient MRN</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter MRN" 
                            {...field}
                            className="bg-slate-600 border-slate-500 text-slate-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="requestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Request Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-600 border-slate-500 text-slate-100">
                              <SelectValue placeholder="Select request type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lab-results">Lab Results</SelectItem>
                            <SelectItem value="imaging">Imaging Results</SelectItem>
                            <SelectItem value="medical-history">Medical History</SelectItem>
                            <SelectItem value="medication-list">Medication List</SelectItem>
                            <SelectItem value="consultation-notes">Consultation Notes</SelectItem>
                            <SelectItem value="full-access">Full Record Access</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Urgency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-600 border-slate-500 text-slate-100">
                              <SelectValue placeholder="Select urgency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low - Routine</SelectItem>
                            <SelectItem value="normal">Normal - Standard</SelectItem>
                            <SelectItem value="high">High - Urgent</SelectItem>
                            <SelectItem value="critical">Critical - Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="requestedData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Specific Data Requested</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Blood test results from last 6 months" 
                          {...field}
                          className="bg-slate-600 border-slate-500 text-slate-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expectedDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Expected Access Duration</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-600 border-slate-500 text-slate-100">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-day">1 Day</SelectItem>
                          <SelectItem value="1-week">1 Week</SelectItem>
                          <SelectItem value="1-month">1 Month</SelectItem>
                          <SelectItem value="3-months">3 Months</SelectItem>
                          <SelectItem value="6-months">6 Months</SelectItem>
                          <SelectItem value="ongoing">Ongoing Care</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Reason for Request</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide a detailed explanation for why you need access to this information"
                          className="bg-slate-600 border-slate-500 text-slate-100 min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
                >
                  {isSubmitting ? "Submitting Request..." : "Submit Access Request"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle className="text-slate-100">Recent Requests</CardTitle>
            <CardDescription className="text-slate-400">
              Track the status of your recent access requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <div key={request.id} className="p-3 border border-slate-600 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="font-medium text-slate-100">{request.patientName}</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(request.status)}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-400 space-y-1">
                    <p>Type: {request.requestType}</p>
                    <p>Urgency: {request.urgency}</p>
                    <p>Submitted: {new Date(request.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccessRequestForm;
