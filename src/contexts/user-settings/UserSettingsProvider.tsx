
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSettings, ThemeSettings, NotificationSettings, PrivacySettings, UserSettingsContextType } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
        // Properly cast the JSON data to our types
        const themeData = data.theme as any;
        const notificationsData = data.notifications as any;
        const privacyData = data.privacy as any;

        setSettings({
          theme: {
            mode: themeData?.mode || defaultSettings.theme.mode,
            accentColor: themeData?.accentColor || defaultSettings.theme.accentColor
          },
          notifications: {
            email: notificationsData?.email ?? defaultSettings.notifications.email,
            push: notificationsData?.push ?? defaultSettings.notifications.push,
            sms: notificationsData?.sms ?? defaultSettings.notifications.sms
          },
          privacy: {
            shareHealthData: privacyData?.shareHealthData ?? defaultSettings.privacy.shareHealthData,
            shareContactInfo: privacyData?.shareContactInfo ?? defaultSettings.privacy.shareContactInfo,
            twoFactorAuth: privacyData?.twoFactorAuth ?? defaultSettings.privacy.twoFactorAuth
          }
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
        .insert({
          user_id: user.id,
          theme: defaultSettings.theme as any,
          notifications: defaultSettings.notifications as any,
          privacy: defaultSettings.privacy as any
        });

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
        .upsert({
          user_id: user.id,
          theme: newSettings.theme as any,
          notifications: newSettings.notifications as any,
          privacy: newSettings.privacy as any
        });

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

  const saveProfileInfo = async (profileData: { firstName?: string; lastName?: string; email?: string }) => {
    if (!user?.id) return;

    try {
      // Only update fields that were provided
      const updateData: Record<string, string> = {};
      if (profileData.firstName !== undefined) updateData.first_name = profileData.firstName;
      if (profileData.lastName !== undefined) updateData.last_name = profileData.lastName;
      
      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);
          
        if (error) throw error;
      }
      
      // Handle email update separately if provided (requires auth update)
      if (profileData.email !== undefined) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email,
        });
        
        if (emailError) throw emailError;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value: UserSettingsContextType = {
    settings,
    loading,
    isLoading: loading,
    updateThemeSettings,
    updateTheme: updateThemeSettings,
    updateNotificationSettings,
    updateNotificationPreferences: updateNotificationSettings,
    updatePrivacySettings,
    resetToDefaults,
    saveProfileInfo
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
