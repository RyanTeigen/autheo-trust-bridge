
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Wallet {
  address: string;
  chainId: number;
}

interface UseWalletReturn {
  wallet: Wallet | null;
  isConnecting: boolean;
  connectMetaMask: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user was previously connected
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.isMetaMask) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            setWallet({
              address: accounts[0],
              chainId: parseInt(chainId, 16)
            });
          }
        } catch (error) {
          console.error('Error checking MetaMask connection:', error);
        }
      }
    };

    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          setWallet(null);
        } else {
          // User switched accounts
          setWallet(prev => prev ? { ...prev, address: accounts[0] } : null);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setWallet(prev => prev ? { ...prev, chainId: parseInt(chainId, 16) } : null);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask extension and refresh the page",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      setWallet({
        address: accounts[0],
        chainId: parseInt(chainId, 16)
      });
    } catch (error: any) {
      console.error('Error connecting to MetaMask:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Could not connect to MetaMask",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected"
    });
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!wallet || !window.ethereum) return null;
    
    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, wallet.address]
      });
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      return null;
    }
  };

  return {
    wallet,
    isConnecting,
    connectMetaMask,
    disconnectWallet,
    signMessage
  };
}
