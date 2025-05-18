
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AppointmentFormProps {
  onSuccess?: () => void;
  className?: string;
  initialDate?: Date;
}

// Define time slot options
const timeSlots = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', 
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
];

// Define appointment types
const appointmentTypes = [
  'Annual Physical',
  'Follow-up',
  'Consultation',
  'Lab Work',
  'Vaccination',
  'Specialist Referral',
  'Mental Health',
  'Other'
];

// Form validation schema
const appointmentSchema = z.object({
  patientName: z.string().min(1, 'Patient name is required'),
  provider: z.string().min(1, 'Provider is required'),
  date: z.date({
    required_error: 'Appointment date is required',
  }),
  time: z.string().min(1, 'Appointment time is required'),
  type: z.string().min(1, 'Appointment type is required'),
  location: z.string().optional(),
  notes: z.string().optional()
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, className, initialDate }) => {
  const { toast } = useToast();
  
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: initialDate || new Date(),
      patientName: '',
      provider: '',
      time: '',
      type: '',
      location: '',
      notes: ''
    }
  });
  
  const onSubmit = (data: AppointmentFormValues) => {
    // Here you would typically save the appointment to your backend
    toast({
      title: "Appointment scheduled",
      description: `${data.patientName} with ${data.provider} on ${format(data.date, 'PPP')} at ${data.time}`,
    });
    
    if (onSuccess) {
      onSuccess();
    }
    
    form.reset();
  };
  
  return (
    <Card className={`${className} bg-slate-800/50 border-slate-700`}>
      <CardHeader>
        <CardTitle className="text-autheo-primary">Schedule Appointment</CardTitle>
        <CardDescription className="text-slate-300">
          Create a new appointment for a patient
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="bg-slate-800 border-slate-700 text-slate-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Provider</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Select provider" 
                        {...field} 
                        className="bg-slate-800 border-slate-700 text-slate-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-slate-200">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal bg-slate-800 border-slate-700 hover:bg-slate-700",
                              !field.value && "text-slate-400"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          className="pointer-events-auto bg-slate-800"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                          <SelectValue placeholder="Select time">
                            {field.value ? field.value : "Select time"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                        {timeSlots.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Appointment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                          <SelectValue placeholder="Select appointment type">
                            {field.value ? field.value : "Select appointment type"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                        {appointmentTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Location (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter location" 
                        {...field}
                        className="bg-slate-800 border-slate-700 text-slate-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Add any additional notes" 
                      {...field}
                      className="bg-slate-800 border-slate-700 text-slate-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit"
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              Schedule Appointment
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AppointmentForm;
