
import React, { createContext, useContext } from 'react';
import { UserSettingsContextType, UserSettings } from './types';
import { defaultSettings } from './defaultSettings';

// Create the context with undefined as default value
const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

// Export the context provider and a hook to use the context
export { UserSettingsContext };

// Create a hook to use the user settings context
export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};
