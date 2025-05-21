
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
      // Sign up with email and password
      const { error: signUpError } = await supabase.auth.signUp({
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
        description: "Welcome to Autheo Health. Please check your email for verification.",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "There was an error during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSignup
  };
};
