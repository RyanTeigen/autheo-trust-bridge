
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSettings, ThemeSettings, NotificationSettings, PrivacySettings } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserSettingsContextType {
  settings: UserSettings;
  loading: boolean;
  updateThemeSettings: (theme: Partial<ThemeSettings>) => Promise<void>;
  updateNotificationSettings: (notifications: Partial<NotificationSettings>) => Promise<void>;
  updatePrivacySettings: (privacy: Partial<PrivacySettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

const defaultSettings: UserSettings = {
  theme: {
    mode: 'system',
    accentColor: '#0ea5e9'
  },
  notifications: {
    email: true,
    push: true,
    sms: false
  },
  privacy: {
    shareHealthData: false,
    shareContactInfo: false,
    twoFactorAuth: false
  }
};

export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserSettings();
    } else {
      setSettings(defaultSettings);
      setLoading(false);
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        setSettings(defaultSettings);
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading user settings:', error);
        setSettings(defaultSettings);
        return;
      }

      if (data) {
        setSettings({
          theme: data.theme || defaultSettings.theme,
          notifications: data.notifications || defaultSettings.notifications,
          privacy: data.privacy || defaultSettings.privacy
        });
      } else {
        // Create default settings for new user
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error in loadUserSettings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .insert([{
          user_id: user.id,
          theme: defaultSettings.theme,
          notifications: defaultSettings.notifications,
          privacy: defaultSettings.privacy
        }]);

      if (error) {
        console.error('Error creating default settings:', error);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error in createDefaultSettings:', error);
    }
  };

  const updateSettings = async (newSettings: UserSettings) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert([{
          user_id: user.id,
          theme: newSettings.theme,
          notifications: newSettings.notifications,
          privacy: newSettings.privacy
        }]);

      if (error) {
        console.error('Error updating settings:', error);
        throw error;
      }

      setSettings(newSettings);
    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw error;
    }
  };

  const updateThemeSettings = async (theme: Partial<ThemeSettings>) => {
    const newSettings = {
      ...settings,
      theme: { ...settings.theme, ...theme }
    };
    await updateSettings(newSettings);
  };

  const updateNotificationSettings = async (notifications: Partial<NotificationSettings>) => {
    const newSettings = {
      ...settings,
      notifications: { ...settings.notifications, ...notifications }
    };
    await updateSettings(newSettings);
  };

  const updatePrivacySettings = async (privacy: Partial<PrivacySettings>) => {
    const newSettings = {
      ...settings,
      privacy: { ...settings.privacy, ...privacy }
    };
    await updateSettings(newSettings);
  };

  const resetToDefaults = async () => {
    await updateSettings(defaultSettings);
  };

  const value = {
    settings,
    loading,
    updateThemeSettings,
    updateNotificationSettings,
    updatePrivacySettings,
    resetToDefaults
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};
