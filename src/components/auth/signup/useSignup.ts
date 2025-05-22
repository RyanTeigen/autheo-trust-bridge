
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
          // Explicitly specify the redirectTo URL to prevent default localhost redirection
          emailRedirectTo: window.location.origin + '/auth',
        },
      });

      if (signUpError) throw signUpError;

      toast({
        title: "Registration successful",
        description: data?.user 
          ? "Welcome to Autheo Health. Please check your email for verification. Note: Don't click the link in the email, as it may redirect to localhost. Instead, check your email for the verification code and enter it directly in the app."
          : "Account created successfully. Please check your email for verification instructions.",
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
        const randomEmail = `${walletAddress.substring(2, 10).toLowerCase()}@wallet.autheo.health`;
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: randomEmail,
          password: walletAddress.substring(2, 22)
        });

        if (error) throw error;

        toast({
          title: "Wallet already registered",
          description: "Signing in with your wallet...",
        });
        return;
      }

      // Generate a deterministic email and password for wallet signup
      const randomEmail = `${walletAddress.substring(2, 10).toLowerCase()}@wallet.autheo.health`;
      const randomPassword = walletAddress.substring(2, 22);

      // Sign up with wallet
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: randomEmail,
        password: randomPassword,
        options: {
          data: {
            roles: roles,
            auth_method: 'wallet',
            wallet_address: walletAddress, // Store wallet address in metadata to ensure it's available
          },
        },
      });

      if (signUpError) throw signUpError;

      // Call the RPC function to update wallet address in profile
      if (data?.user) {
        const { error: rpcError } = await supabase
          .rpc('update_wallet_address', {
            user_id: data.user.id,
            wallet: walletAddress
          });

        if (rpcError) {
          console.error("Error updating profile with wallet:", rpcError);
          // Don't throw here - we want the signup to succeed even if the wallet update fails
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
