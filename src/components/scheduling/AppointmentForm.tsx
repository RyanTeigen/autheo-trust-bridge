
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
              <InputField
                form={form}
                name="patientName"
                label="Patient Name"
                placeholder="Enter patient name"
              />
              
              <InputField
                form={form}
                name="provider"
                label="Provider"
                placeholder="Select provider"
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
              label="Notes"
              placeholder="Add any additional notes"
              required={false}
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
