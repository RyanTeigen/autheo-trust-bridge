
// hooks/useEncryptionSetup.ts

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ensureUserKeys } from '@/utils/encryption/keys';
import { useToast } from '@/hooks/use-toast';

export const useEncryptionSetup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSetup, setIsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const setupEncryption = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        await ensureUserKeys(user.id);
        setIsSetup(true);
      } catch (error) {
        console.error('Failed to setup encryption keys:', error);
        toast({
          title: 'Encryption Setup Failed',
          description: 'Could not initialize secure encryption keys',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    setupEncryption();
  }, [user, toast]);

  return { isSetup, isLoading };
};
