/**
 * React hook for Autheo DID authentication
 */

import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';
import { autheoDidService, DIDDocument } from '@/services/identity/AutheoDIDService';
import { siweService, SIWEMessage } from '@/services/identity/SIWEService';
import { supabase } from '@/integrations/supabase/client';

interface AutheoDIDState {
  did: string | null;
  didDocument: DIDDocument | null;
  isAuthenticated: boolean;
  isVerifying: boolean;
  isRegistering: boolean;
  error: string | null;
}

interface UseAutheoIDReturn extends AutheoDIDState {
  connectWithDID: () => Promise<{ success: boolean; token?: string }>;
  registerWithDID: () => Promise<{ success: boolean; token?: string }>;
  signMessage: (message: string) => Promise<string | null>;
  verifyDID: (did: string) => Promise<boolean>;
  disconnect: () => void;
}

export function useAutheoID(): UseAutheoIDReturn {
  const { wallet, connectMetaMask, signMessage: walletSignMessage, isConnecting } = useWallet();
  const { toast } = useToast();
  
  const [state, setState] = useState<AutheoDIDState>({
    did: null,
    didDocument: null,
    isAuthenticated: false,
    isVerifying: false,
    isRegistering: false,
    error: null
  });

  // Update DID when wallet changes
  useEffect(() => {
    if (wallet?.address) {
      const did = autheoDidService.generateDID(wallet.address);
      setState(prev => ({ ...prev, did }));
    } else {
      setState(prev => ({ 
        ...prev, 
        did: null, 
        didDocument: null, 
        isAuthenticated: false 
      }));
    }
  }, [wallet?.address]);

  /**
   * Sign in with Autheo DID
   */
  const connectWithDID = useCallback(async (): Promise<{ success: boolean; token?: string }> => {
    try {
      setState(prev => ({ ...prev, isVerifying: true, error: null }));

      // Ensure wallet is connected
      if (!wallet?.address) {
        await connectMetaMask();
        // Wait a bit for wallet state to update
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const address = wallet?.address;
      if (!address) {
        throw new Error('Please connect your wallet first');
      }

      // Generate nonce and create SIWE message
      const nonce = siweService.generateNonce();
      const siweMessage = siweService.createMessage(address, nonce, {
        statement: 'Sign in to Autheo Health with your decentralized identity.',
        expirationMinutes: 15
      });
      const messageString = siweService.formatMessage(siweMessage);

      // Request signature from wallet
      const signature = await walletSignMessage(messageString);
      if (!signature) {
        throw new Error('Signature request was cancelled');
      }

      // Call edge function to verify and authenticate
      const { data, error } = await supabase.functions.invoke('auth/did-login', {
        body: {
          message: messageString,
          signature,
          address,
          nonce
        }
      });

      if (error) {
        throw new Error(error.message || 'Authentication failed');
      }

      if (!data?.token) {
        throw new Error('No authentication token received');
      }

      // Generate DID document
      const did = autheoDidService.generateDID(address);
      const didDocument = autheoDidService.createDIDDocument(address);

      setState(prev => ({
        ...prev,
        did,
        didDocument,
        isAuthenticated: true,
        isVerifying: false,
        error: null
      }));

      toast({
        title: 'Connected with Autheo ID',
        description: `Authenticated as ${did.substring(0, 20)}...`
      });

      return { success: true, token: data.token };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setState(prev => ({ 
        ...prev, 
        isVerifying: false, 
        error: errorMessage 
      }));
      
      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false };
    }
  }, [wallet, connectMetaMask, walletSignMessage, toast]);

  /**
   * Register a new account with Autheo DID
   */
  const registerWithDID = useCallback(async (): Promise<{ success: boolean; token?: string }> => {
    try {
      setState(prev => ({ ...prev, isRegistering: true, error: null }));

      // Ensure wallet is connected
      if (!wallet?.address) {
        await connectMetaMask();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const address = wallet?.address;
      if (!address) {
        throw new Error('Please connect your wallet first');
      }

      // Generate nonce and create SIWE message for registration
      const nonce = siweService.generateNonce();
      const siweMessage = siweService.createMessage(address, nonce, {
        statement: 'Register for Autheo Health with your decentralized identity. This will create a new account linked to your wallet.',
        expirationMinutes: 15
      });
      const messageString = siweService.formatMessage(siweMessage);

      // Request signature from wallet
      const signature = await walletSignMessage(messageString);
      if (!signature) {
        throw new Error('Signature request was cancelled');
      }

      // Create DID document
      const did = autheoDidService.generateDID(address);
      const didDocument = autheoDidService.createDIDDocument(address);

      // Call edge function to register
      const { data, error } = await supabase.functions.invoke('auth/did-register', {
        body: {
          message: messageString,
          signature,
          address,
          nonce,
          didDocument
        }
      });

      if (error) {
        throw new Error(error.message || 'Registration failed');
      }

      if (!data?.token) {
        throw new Error('No authentication token received');
      }

      setState(prev => ({
        ...prev,
        did,
        didDocument,
        isAuthenticated: true,
        isRegistering: false,
        error: null
      }));

      toast({
        title: 'Registered with Autheo ID',
        description: `Your DID: ${did.substring(0, 25)}...`
      });

      return { success: true, token: data.token };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({ 
        ...prev, 
        isRegistering: false, 
        error: errorMessage 
      }));
      
      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return { success: false };
    }
  }, [wallet, connectMetaMask, walletSignMessage, toast]);

  /**
   * Sign a message with the connected wallet
   */
  const signMessage = useCallback(async (message: string): Promise<string | null> => {
    if (!wallet?.address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive'
      });
      return null;
    }

    try {
      return await walletSignMessage(message);
    } catch (error) {
      console.error('Failed to sign message:', error);
      return null;
    }
  }, [wallet, walletSignMessage, toast]);

  /**
   * Verify a DID is valid and resolvable
   */
  const verifyDID = useCallback(async (did: string): Promise<boolean> => {
    try {
      const result = await autheoDidService.resolveDID(did);
      return result.didDocument !== null;
    } catch (error) {
      console.error('DID verification failed:', error);
      return false;
    }
  }, []);

  /**
   * Disconnect DID session
   */
  const disconnect = useCallback(() => {
    setState({
      did: null,
      didDocument: null,
      isAuthenticated: false,
      isVerifying: false,
      isRegistering: false,
      error: null
    });
  }, []);

  return {
    ...state,
    connectWithDID,
    registerWithDID,
    signMessage,
    verifyDID,
    disconnect
  };
}

export default useAutheoID;
