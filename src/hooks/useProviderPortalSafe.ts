import { useContext } from 'react';
import { ProviderPortalContext } from '@/contexts/ProviderPortalContext';

export const useProviderPortalSafe = () => {
  const context = useContext(ProviderPortalContext);
  
  // Return null if context is not available (outside provider portal)
  return context || null;
};