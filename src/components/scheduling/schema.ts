
import { z } from 'zod';

// Form validation schema for appointment
export const appointmentSchema = z.object({
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

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
