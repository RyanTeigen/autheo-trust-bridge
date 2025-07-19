
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const appointmentSchema = z.object({
  appointment_type: z.string().min(1, 'Please select an appointment type'),
  appointment_date: z.date({
    required_error: 'Please select a date',
  }),
  appointment_time: z.string().min(1, 'Please select a time'),
  provider_preference: z.string().optional(),
  reason: z.string().min(10, 'Please provide a detailed reason (at least 10 characters)'),
  urgency_level: z.enum(['normal', 'urgent', 'emergency']).default('normal'),
  preferred_location: z.string().optional(),
  insurance_info: z.string().optional(),
  additional_notes: z.string().optional(),
});

type PatientAppointmentFormValues = z.infer<typeof appointmentSchema>;

interface PatientAppointmentFormProps {
  onSuccess?: () => void;
  className?: string;
  initialDate?: Date;
}

const appointmentTypes = [
  { value: 'Annual Physical', label: 'Annual Physical' },
  { value: 'Follow-up', label: 'Follow-up Visit' },
  { value: 'Consultation', label: 'Specialist Consultation' },
  { value: 'Urgent Care', label: 'Urgent Care' },
  { value: 'Mental Health', label: 'Mental Health' },
  { value: 'Lab Work', label: 'Laboratory Tests' },
  { value: 'Vaccination', label: 'Vaccination' },
  { value: 'Physical Therapy', label: 'Physical Therapy' },
  { value: 'Telehealth', label: 'Telehealth Visit' },
];

const timeSlots = [
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM'
];

const PatientAppointmentForm: React.FC<PatientAppointmentFormProps> = ({ 
  onSuccess, 
  className, 
  initialDate 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<PatientAppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointment_date: initialDate || new Date(),
      urgency_level: 'normal',
      appointment_type: '',
      appointment_time: '',
      reason: '',
      provider_preference: '',
      preferred_location: '',
      insurance_info: '',
      additional_notes: ''
    }
  });
  
  const onSubmit = async (data: PatientAppointmentFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to request appointments.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get or create patient record
      let { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError || !patient) {
        // Create patient record if it doesn't exist
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            full_name: user.email || 'Unknown',
            email: user.email || ''
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error('Failed to create patient record');
        }
        patient = newPatient;
      }

      // Create appointment date-time
      const [time, period] = data.appointment_time.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      
      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      const appointmentDateTime = new Date(data.appointment_date);
      appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);

      // For patient requests, we'll create a "request" that needs provider assignment
      // In a real system, this would go through a scheduling system
      const clinicalNotes = `Patient Request: ${data.reason}${data.provider_preference ? `\nPreferred Provider: ${data.provider_preference}` : ''}${data.preferred_location ? `\nPreferred Location: ${data.preferred_location}` : ''}${data.insurance_info ? `\nInsurance: ${data.insurance_info}` : ''}${data.additional_notes ? `\nAdditional Notes: ${data.additional_notes}` : ''}`;

      // For now, we'll use a placeholder provider ID
      // In production, this would be handled by the scheduling system
      const placeholderProviderId = '00000000-0000-0000-0000-000000000000';

      const { data: appointment, error: appointmentError } = await supabase
        .from('enhanced_appointments')
        .insert({
          patient_id: patient.id,
          provider_id: placeholderProviderId, // Will be assigned by scheduling system
          appointment_date: appointmentDateTime.toISOString(),
          appointment_type: data.appointment_type,
          status: 'scheduled',
          urgency_level: data.urgency_level,
          clinical_notes: clinicalNotes,
          access_request_status: 'pending'
        })
        .select()
        .single();

      if (appointmentError) {
        throw new Error('Failed to create appointment: ' + appointmentError.message);
      }

      console.log('✅ Appointment request created:', appointment.id);
      
      toast({
        title: "Appointment Request Submitted",
        description: `Your ${data.appointment_type} appointment request for ${format(appointmentDateTime, 'PPP')} at ${data.appointment_time} has been submitted. You will be notified once a provider is assigned.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset();
      
    } catch (error) {
      console.error('Error creating appointment request:', error);
      toast({
        title: "Error submitting request",
        description: error instanceof Error ? error.message : "Failed to submit appointment request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className={`${className} bg-slate-800/50 border-slate-700`}>
      <CardHeader>
        <CardTitle className="text-autheo-primary">Request New Appointment</CardTitle>
        <CardDescription className="text-slate-300">
          Submit an appointment request. A provider will be assigned and you'll receive confirmation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Appointment Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue placeholder="Select appointment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        {appointmentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-slate-100 focus:bg-slate-600">
                            {type.label}
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
                name="urgency_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Urgency Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="normal" className="text-slate-100 focus:bg-slate-600">Normal</SelectItem>
                        <SelectItem value="urgent" className="text-slate-100 focus:bg-slate-600">Urgent</SelectItem>
                        <SelectItem value="emergency" className="text-slate-100 focus:bg-slate-600">Emergency</SelectItem>
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
                name="appointment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-slate-200">Preferred Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "bg-slate-700 border-slate-600 text-slate-100 pl-3 text-left font-normal hover:bg-slate-600",
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
                      <PopoverContent className="w-auto p-0 bg-slate-700 border-slate-600" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="bg-slate-700 text-slate-100"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointment_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Preferred Time *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-700 border-slate-600 max-h-[200px]">
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time} className="text-slate-100 focus:bg-slate-600">
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

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Reason for Visit *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the reason for your appointment request..."
                      className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="provider_preference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Preferred Provider</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dr. Smith, Dr. Johnson, etc."
                        className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferred_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Preferred Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Main Campus, Downtown, Virtual, etc."
                        className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="insurance_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Insurance Information</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Insurance provider and plan details (optional)"
                      className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additional_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information you'd like to share..."
                      className="bg-slate-700 border-slate-600 text-slate-100 placeholder:text-slate-400"
                      rows={3}
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
              className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Appointment Request'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PatientAppointmentForm;
