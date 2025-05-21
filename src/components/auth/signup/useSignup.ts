
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

  const handleWalletSignup = async (walletAddress: string, roles: string[]) => {
    if (!walletAddress) {
      toast({
        title: "Wallet address required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if wallet already exists
      const { data: existingWallets, error: existingError } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .limit(1);
        
      if (existingError) {
        console.error("Error checking existing wallet:", existingError);
      }
      
      if (existingWallets && existingWallets.length > 0) {
        // Wallet exists, attempt to sign in instead
        // Instead of using OAuth with 'custom' provider, we'll use a deterministic email approach
        const randomEmail = `${walletAddress.substring(2, 10).toLowerCase()}@wallet.autheo.health`;
        
        // For wallet login flow, we'll use signInWithPassword here
        // Users will need to complete authentication via wallet signature later
        const { data, error } = await supabase.auth.signInWithPassword({
          email: randomEmail,
          // Use a part of the wallet address as the password (this is just for flow)
          password: walletAddress.substring(2, 22)
        });

        if (error) throw error;

        toast({
          title: "Wallet already registered",
          description: "Signing in with your wallet...",
        });
        return;
      }

      // Sign up with wallet
      // Generate a deterministic email since Supabase requires one
      const randomEmail = `${walletAddress.substring(2, 10).toLowerCase()}@wallet.autheo.health`;
      const randomPassword = walletAddress.substring(2, 22); // Use part of wallet address as password

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: randomEmail,
        password: randomPassword, // This won't be used for login directly
        options: {
          data: {
            roles: roles,
            auth_method: 'wallet',
          },
        },
      });

      if (signUpError) throw signUpError;

      // Update profile with wallet address (using custom SQL or RPC call)
      if (data?.user) {
        // Since we can't directly update wallet_address in profiles table through the default
        // interface, we'll use an update with a custom query to set wallet_address
        
        // First, check if the user exists in profiles
        const { data: profileCheck, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();
          
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error("Error checking profile:", profileCheckError);
        }
        
        // If the profile exists, update it with the wallet address using RPC
        const { error: rpcError } = await supabase
          .rpc('update_wallet_address', {
            user_id: data.user.id,
            wallet: walletAddress
          });

        if (rpcError) {
          console.error("Error updating profile with wallet:", rpcError);
        }
      }

      toast({
        title: "Wallet registration successful",
        description: "Your wallet has been connected to Autheo Health",
      });

    } catch (error: any) {
      console.error("Wallet registration error:", error);
      toast({
        title: "Wallet registration failed",
        description: error.message || "There was an error connecting your wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSignup,
    handleWalletSignup
  };
};
