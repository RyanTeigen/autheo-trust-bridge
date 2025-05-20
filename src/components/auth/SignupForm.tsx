
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Wallet, UserRound, Stethoscope } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  roles: z.array(z.enum(['patient', 'provider', 'compliance'])).refine(
    (roles) => roles.length > 0 && !(roles.includes('patient') && roles.includes('provider') && roles.includes('compliance')), 
    { message: "Select at least one role and not all three" }
  ),
});

type FormValues = z.infer<typeof formSchema>;

const roleOptions = [
  { id: 'patient', label: 'Patient', icon: <UserRound className="h-4 w-4 text-blue-400" /> },
  { id: 'provider', label: 'Provider', icon: <Stethoscope className="h-4 w-4 text-green-400" /> },
  { id: 'compliance', label: 'Compliance Officer', icon: <Shield className="h-4 w-4 text-purple-400" /> },
];

const SignupForm: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roles: [],
    },
  });

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) {
        return prev.filter(r => r !== role);
      } else {
        // Check if adding this role would result in all three roles being selected
        const newRoles = [...prev, role];
        if (newRoles.includes('patient') && newRoles.includes('provider') && newRoles.includes('compliance')) {
          toast({
            title: "Role selection error",
            description: "You cannot select all three roles",
            variant: "destructive",
          });
          return prev;
        }
        return newRoles;
      }
    });
  };

  const onSubmit = async (values: FormValues) => {
    if (selectedRoles.length === 0) {
      toast({
        title: "Role selection required",
        description: "Please select at least one role",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Sign up with email and password
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            roles: selectedRoles,
          },
        },
      });

      if (signUpError) throw signUpError;

      toast({
        title: "Registration successful",
        description: "Welcome to Autheo Health. Please check your email for verification.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "There was an error during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">First Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter first name" 
                      {...field} 
                      className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Last Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter last name" 
                      {...field} 
                      className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    {...field} 
                    className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-200">Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Create a password" 
                    type="password" 
                    {...field} 
                    className="bg-slate-700/50 border-slate-600 placeholder-slate-400 text-slate-100"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel className="text-slate-200 block mb-2">Select Your Roles</FormLabel>
            <p className="text-xs text-slate-400 mb-3">
              Select the roles you want to use in the app. You can select multiple roles but not all three.
            </p>
            
            <div className="grid grid-cols-1 gap-2">
              {roleOptions.map((role) => (
                <div 
                  key={role.id}
                  className={`flex items-center p-2 rounded-md border cursor-pointer ${
                    selectedRoles.includes(role.id) 
                      ? 'border-autheo-primary bg-autheo-primary/10' 
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => {
                    handleRoleToggle(role.id);
                    form.setValue('roles', selectedRoles.includes(role.id) 
                      ? selectedRoles.filter(r => r !== role.id) as any
                      : [...selectedRoles, role.id] as any
                    );
                  }}
                >
                  <Checkbox 
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => {
                      handleRoleToggle(role.id);
                      form.setValue('roles', selectedRoles.includes(role.id) 
                        ? selectedRoles.filter(r => r !== role.id) as any
                        : [...selectedRoles, role.id] as any
                      );
                    }}
                    className="mr-2"
                  />
                  <div className="flex items-center">
                    <span className="mr-2">{role.icon}</span>
                    <span className="text-slate-200">{role.label}</span>
                  </div>
                </div>
              ))}
            </div>
            {form.formState.errors.roles && (
              <p className="text-sm font-medium text-red-500 mt-1">
                {form.formState.errors.roles.message}
              </p>
            )}
          </div>

          <Button 
            type="submit"
            className="w-full"
            disabled={isLoading || selectedRoles.length === 0}
            variant="autheo"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-slate-800 text-slate-400">or register with</span>
        </div>
      </div>

      <Button
        variant="autheo-outline"
        className="w-full"
        onClick={() => toast({
          title: "Coming Soon",
          description: "Wallet registration will be available in the next update",
        })}
      >
        <Wallet className="mr-2 h-4 w-4" />
        Register with Wallet
      </Button>
    </div>
  );
};

export default SignupForm;
