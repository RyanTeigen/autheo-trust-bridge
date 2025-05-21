
import { z } from 'zod';

export const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .refine(
      (password) => /[A-Z]/.test(password), 
      { message: "Password must contain at least one uppercase letter" }
    )
    .refine(
      (password) => /[0-9]/.test(password),
      { message: "Password must contain at least one number" }
    ),
  roles: z.array(z.enum(['patient', 'provider', 'compliance'])).refine(
    (roles) => roles.length > 0 && !(roles.includes('patient') && roles.includes('provider') && roles.includes('compliance')), 
    { message: "Select at least one role and not all three" }
  ),
});

export type FormValues = z.infer<typeof formSchema>;

export const roleOptions = [
  { id: 'patient', label: 'Patient', icon: 'UserRound', iconColor: 'text-blue-400' },
  { id: 'provider', label: 'Provider', icon: 'Stethoscope', iconColor: 'text-green-400' },
  { id: 'compliance', label: 'Compliance Officer', icon: 'Shield', iconColor: 'text-purple-400' },
];
