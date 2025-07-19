
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { appointmentSchema, type AppointmentFormValues } from './schema';
import { appointmentTypes, timeSlots } from './constants';
import DatePickerField from './DatePickerField';
import SelectField from './SelectField';
import InputField from './InputField';

interface AppointmentFormProps {
  onSuccess?: () => void;
  className?: string;
  initialDate?: Date;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, className, initialDate }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  const onSubmit = async (data: AppointmentFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to schedule appointments.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First, find the patient by name or email
      let patientQuery = supabase
        .from('patients')
        .select('id, user_id')
        .ilike('full_name', `%${data.patientName}%`);

      // If it looks like an email, search by email instead
      if (data.patientName.includes('@')) {
        patientQuery = supabase
          .from('patients')
          .select('id, user_id')
          .eq('email', data.patientName);
      }

      const { data: patients, error: patientError } = await patientQuery;

      if (patientError) {
        throw new Error('Error finding patient: ' + patientError.message);
      }

      if (!patients || patients.length === 0) {
        toast({
          title: "Patient not found",
          description: "Please check the patient name or email and try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const patient = patients[0];

      // Combine date and time into a proper timestamp
      const appointmentDateTime = new Date(data.date);
      const [time, period] = data.time.split(' ');
      const [hours, minutes] = time.split(':');
      let hour24 = parseInt(hours);
      
      if (period === 'PM' && hour24 !== 12) {
        hour24 += 12;
      } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0;
      }
      
      appointmentDateTime.setHours(hour24, parseInt(minutes), 0, 0);

      // Determine urgency level based on appointment type
      let urgencyLevel = 'normal';
      if (data.type === 'Emergency') {
        urgencyLevel = 'emergency';
      } else if (data.type === 'Urgent Care') {
        urgencyLevel = 'urgent';
      }

      // Create the appointment in enhanced_appointments table
      const { data: appointment, error: appointmentError } = await supabase
        .from('enhanced_appointments')
        .insert({
          patient_id: patient.id,
          provider_id: user.id,
          appointment_date: appointmentDateTime.toISOString(),
          appointment_type: data.type,
          status: 'scheduled',
          urgency_level: urgencyLevel,
          clinical_notes: data.notes || `Appointment scheduled at ${data.location || 'TBD'}`
        })
        .select()
        .single();

      if (appointmentError) {
        throw new Error('Failed to create appointment: ' + appointmentError.message);
      }

      console.log('✅ Appointment created:', appointment.id);
      
      toast({
        title: "Appointment scheduled",
        description: `Appointment with ${data.patientName} scheduled for ${format(appointmentDateTime, 'PPP')} at ${data.time}. Patient will receive a notification to approve access to medical records.`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.reset();
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Error scheduling appointment",
        description: error instanceof Error ? error.message : "Failed to schedule appointment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
              <InputField
                form={form}
                name="patientName"
                label="Patient Name or Email"
                placeholder="Enter patient name or email"
              />
              
              <InputField
                form={form}
                name="provider"
                label="Provider Notes"
                placeholder="Additional provider information"
                required={false}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePickerField form={form} />
              
              <SelectField
                form={form}
                name="time"
                label="Time"
                placeholder="Select time"
                options={timeSlots}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                form={form}
                name="type"
                label="Appointment Type"
                placeholder="Select appointment type"
                options={appointmentTypes}
              />
              
              <InputField
                form={form}
                name="location"
                label="Location"
                placeholder="Enter location"
                required={false}
              />
            </div>
            
            <InputField
              form={form}
              name="notes"
              label="Clinical Notes"
              placeholder="Add clinical justification or notes"
              required={false}
            />
            
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AppointmentForm;
