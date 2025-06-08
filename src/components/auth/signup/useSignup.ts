
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FormValues } from './schema';
import { 
  validateDataIntegrity, 
  emailSchema, 
  passwordSchema, 
  nameSchema,
  sanitizeEmail,
  sanitizeString 
} from '@/utils/validation';
import { 
  asyncHandler, 
  handleSupabaseError, 
  ValidationError, 
  DuplicateError,
  logError 
} from '@/utils/errorHandling';
import { validateRateLimit } from '@/utils/security';

export const useSignup = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = asyncHandler(async (values: FormValues) => {
    setIsLoading(true);
    
    try {
      // Step 1: Validate and sanitize input data
      const sanitizedValues = {
        firstName: sanitizeString(values.firstName),
        lastName: sanitizeString(values.lastName),
        email: sanitizeEmail(values.email),
        password: values.password, // Don't sanitize password as it may contain special chars
        roles: values.roles
      };
      
      // Step 2: Additional validation
      validateDataIntegrity(sanitizedValues.firstName, nameSchema, 'First Name');
      validateDataIntegrity(sanitizedValues.lastName, nameSchema, 'Last Name');
      validateDataIntegrity(sanitizedValues.email, emailSchema, 'Email');
      validateDataIntegrity(sanitizedValues.password, passwordSchema, 'Password');
      
      if (sanitizedValues.roles.length === 0) {
        throw new ValidationError('Please select at least one role');
      }
      
      if (sanitizedValues.roles.length === 3) {
        throw new ValidationError('Cannot select all three roles');
      }
      
      // Step 3: Rate limiting check (by IP would be better, but using email as fallback)
      if (!validateRateLimit(sanitizedValues.email, 'signup_attempt', 3, 300000)) {
        throw new ValidationError('Too many signup attempts. Please wait 5 minutes before trying again.');
      }
      
      // Step 4: Check if email already exists
      const { data: existingUsers, error: existingError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', sanitizedValues.email)
        .limit(1);
        
      if (existingError) {
        throw handleSupabaseError(existingError);
      }
      
      if (existingUsers && existingUsers.length > 0) {
        throw new DuplicateError('Email address');
      }

      // Step 5: Sign up with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: sanitizedValues.email,
        password: sanitizedValues.password,
        options: {
          data: {
            first_name: sanitizedValues.firstName,
            last_name: sanitizedValues.lastName,
            roles: sanitizedValues.roles,
          },
          emailRedirectTo: window.location.origin + '/auth',
        },
      });

      if (signUpError) {
        throw handleSupabaseError(signUpError);
      }

      if (!data?.user) {
        throw new ValidationError('Signup failed - no user data returned');
      }

      toast({
        title: "Registration successful",
        description: "Welcome to Autheo Health. Please check your email for verification. Note: Don't click the link in the email, as it may redirect to localhost. Instead, check your email for the verification code and enter it directly in the app.",
      });
      
      return true;
      
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DuplicateError) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        logError(error as any, { context: 'user_signup' });
        toast({
          title: "Registration failed",
          description: "There was an error during registration. Please try again.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  });

  const handleWalletSignup = asyncHandler(async (walletAddress: string, roles: string[]) => {
    setIsLoading(true);
    
    try {
      // Step 1: Validate inputs
      if (!walletAddress || typeof walletAddress !== 'string') {
        throw new ValidationError('Please connect your wallet first');
      }
      
      if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new ValidationError('Invalid wallet address format');
      }
      
      if (!Array.isArray(roles) || roles.length === 0) {
        throw new ValidationError('Please select at least one role');
      }
      
      // Step 2: Rate limiting
      if (!validateRateLimit(walletAddress, 'wallet_signup', 3, 300000)) {
        throw new ValidationError('Too many wallet signup attempts. Please wait 5 minutes.');
      }
      
      // Step 3: Check if wallet already exists
      const { data: existingWallets, error: existingError } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', walletAddress)
        .limit(1);
        
      if (existingError) {
        throw handleSupabaseError(existingError);
      }
      
      if (existingWallets && existingWallets.length > 0) {
        // Wallet exists, attempt to sign in instead
        const randomEmail = `${walletAddress.substring(2, 10).toLowerCase()}@wallet.autheo.health`;
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: randomEmail,
          password: walletAddress.substring(2, 22)
        });

        if (error) {
          throw handleSupabaseError(error);
        }

        toast({
          title: "Wallet already registered",
          description: "Signing in with your wallet...",
        });
        return true;
      }

      // Step 4: Generate deterministic credentials for wallet signup
      const randomEmail = `${walletAddress.substring(2, 10).toLowerCase()}@wallet.autheo.health`;
      const randomPassword = walletAddress.substring(2, 22);

      // Step 5: Sign up with wallet
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: randomEmail,
        password: randomPassword,
        options: {
          data: {
            roles: roles,
            auth_method: 'wallet',
            wallet_address: walletAddress,
          },
        },
      });

      if (signUpError) {
        throw handleSupabaseError(signUpError);
      }

      if (!data?.user) {
        throw new ValidationError('Wallet signup failed - no user data returned');
      }

      // Step 6: Update wallet address in profile
      const { error: rpcError } = await supabase
        .rpc('update_wallet_address', {
          user_id: data.user.id,
          wallet: walletAddress
        });

      if (rpcError) {
        console.error("Error updating profile with wallet:", rpcError);
        // Don't fail the signup for this error
      }

      toast({
        title: "Wallet registration successful",
        description: "Your wallet has been connected to Autheo Health",
      });
      
      return true;

    } catch (error) {
      if (error instanceof ValidationError) {
        toast({
          title: "Wallet registration failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        logError(error as any, { context: 'wallet_signup', walletAddress });
        toast({
          title: "Wallet registration failed",
          description: "There was an error connecting your wallet. Please try again.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  });

  return {
    isLoading,
    handleSignup,
    handleWalletSignup
  };
};
