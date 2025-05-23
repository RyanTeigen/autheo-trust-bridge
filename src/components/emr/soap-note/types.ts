
import { z } from 'zod';

export const soapNoteFormSchema = z.object({
  patientId: z.string().min(1, { message: "Patient ID is required" }),
  patientName: z.string().min(1, { message: "Patient name is required" }),
  visitDate: z.string().min(1, { message: "Visit date is required" }),
  providerName: z.string().min(1, { message: "Provider name is required" }),
  subjective: z.string().min(10, { message: "Subjective section must be at least 10 characters" }),
  objective: z.string().min(10, { message: "Objective section must be at least 10 characters" }),
  assessment: z.string().min(10, { message: "Assessment section must be at least 10 characters" }),
  plan: z.string().min(10, { message: "Plan section must be at least 10 characters" }),
  shareWithPatient: z.boolean().default(false),
  temporaryAccess: z.boolean().default(true),
  accessDuration: z.number().int().min(1).default(30),
});

export type SOAPNoteFormValues = z.infer<typeof soapNoteFormSchema>;

export interface SOAPNoteStatus {
  isSubmitting: boolean;
  isDistributing: boolean;
}

export type AccessLevel = 'full' | 'temporary' | 'revoked';

export interface NoteAccessControl {
  id: string;
  provider_id: string;
  provider_name: string;
  access_level: AccessLevel;
  granted_at: string;
  expires_at: string | null;
  note_id: string;
  patient_id: string;
}
