
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(254, 'Email must not exceed 254 characters')
  .toLowerCase()
  .trim();

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(100, 'Name must not exceed 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .trim();

export const uuidSchema = z.string()
  .uuid('Invalid UUID format');

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]{10,15}$/, 'Invalid phone number format')
  .optional();

export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed <= new Date();
  }, 'Invalid or future date');

// Medical data validation schemas
export const medicalRecordSchema = z.object({
  patientId: uuidSchema,
  providerId: uuidSchema,
  data: z.record(z.unknown()).refine(
    (data) => Object.keys(data).length > 0,
    'Medical data cannot be empty'
  ),
  recordedAt: z.string().datetime('Invalid datetime format'),
  notes: z.string().max(2000, 'Notes must not exceed 2000 characters').optional(),
});

export const soapNoteSchema = z.object({
  patientId: uuidSchema,
  patientName: nameSchema,
  visitDate: dateSchema,
  providerName: nameSchema,
  subjective: z.string()
    .min(10, 'Subjective section must be at least 10 characters')
    .max(5000, 'Subjective section must not exceed 5000 characters'),
  objective: z.string()
    .min(10, 'Objective section must be at least 10 characters')
    .max(5000, 'Objective section must not exceed 5000 characters'),
  assessment: z.string()
    .min(10, 'Assessment section must be at least 10 characters')
    .max(5000, 'Assessment section must not exceed 5000 characters'),
  plan: z.string()
    .min(10, 'Plan section must be at least 10 characters')
    .max(5000, 'Plan section must not exceed 5000 characters'),
  shareWithPatient: z.boolean(),
  temporaryAccess: z.boolean(),
  accessDuration: z.number().int().min(1).max(365),
});

// Fitness data validation
export const fitnessDataSchema = z.object({
  userId: uuidSchema,
  dataType: z.enum(['activity', 'heart_rate', 'sleep', 'nutrition', 'weight']),
  data: z.record(z.unknown()),
  recordedAt: z.string().datetime(),
  externalId: z.string().max(255).optional(),
});

// Input sanitization functions
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email).toLowerCase();
  const result = emailSchema.safeParse(sanitized);
  
  if (!result.success) {
    throw new Error(`Invalid email: ${result.error.errors[0].message}`);
  }
  
  return result.data;
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Data integrity validation
export function validateDataIntegrity<T>(
  data: T,
  schema: z.ZodSchema<T>,
  context?: string
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      throw new Error(
        `Data validation failed${context ? ` for ${context}` : ''}: ${errorMessages}`
      );
    }
    throw error;
  }
}

// Role and permission validation
export const userRoleSchema = z.enum(['patient', 'provider', 'compliance', 'admin']);

export function validateUserRole(role: unknown): string {
  const result = userRoleSchema.safeParse(role);
  if (!result.success) {
    throw new Error('Invalid user role');
  }
  return result.data;
}

export function validatePermissions(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'patient': 1,
    'provider': 2,
    'compliance': 3,
    'admin': 4
  };
  
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;
  
  return userLevel >= requiredLevel;
}
