
import { z } from 'zod';

export const glucoseSchema = z.object({
  glucose: z.number().min(20, 'Glucose level too low').max(600, 'Glucose level too high'),
  recordedAt: z.string().min(1, 'Date and time are required'),
  mealTiming: z.enum(['fasting', 'before_meal', 'after_meal', '2hr_post_meal', 'bedtime', 'random']),
  notes: z.string().optional()
});

export const hba1cSchema = z.object({
  hba1c: z.number().min(3, 'HbA1c too low').max(20, 'HbA1c too high'),
  recordedAt: z.string().min(1, 'Date and time are required'),
  testType: z.enum(['lab', 'home', 'point_of_care']),
  notes: z.string().optional()
});

export type GlucoseFormData = z.infer<typeof glucoseSchema>;
export type HbA1cFormData = z.infer<typeof hba1cSchema>;
