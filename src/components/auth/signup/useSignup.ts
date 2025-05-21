
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FormValues } from './schema';

export const useSignup = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (values: FormValues) => {
    if (values.roles.length === 0) {
      toast({
        title: "Role selection required",
        description: "Please select at least one role",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if email already exists before attempting to sign up
      const { data: existingUsers, error: existingError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', values.email)
        .limit(1);
        
      if (existingError) {
        console.error("Error checking existing user:", existingError);
      }
      
      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Email already in use",
          description: "This email address is already registered. Please use another email or try to log in.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sign up with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            roles: values.roles,
          },
        },
      });

      if (signUpError) throw signUpError;

      toast({
        title: "Registration successful",
        description: data?.user 
          ? "Welcome to Autheo Health. Please check your email for verification." 
          : "Account created successfully. Please check your email to verify your account.",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Provide more specific error messages based on error type
      if (error.message?.includes('email')) {
        toast({
          title: "Registration failed",
          description: "Invalid email address or email already in use.",
          variant: "destructive",
        });
      } else if (error.message?.includes('password')) {
        toast({
          title: "Registration failed",
          description: "Password doesn't meet requirements.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration failed",
          description: error.message || "There was an error during registration. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSignup
  };
};
