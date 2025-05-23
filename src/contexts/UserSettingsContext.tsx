
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  accentColor: string;
}

interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

interface PrivacySettings {
  shareHealthData: boolean;
  shareContactInfo: boolean;
  twoFactorAuth: boolean;
}

export interface UserSettings {
  theme: ThemeSettings;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

interface UserSettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  updateTheme: (theme: Partial<ThemeSettings>) => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  saveProfileInfo: (profileData: { firstName?: string; lastName?: string; email?: string }) => Promise<void>;
}

const defaultSettings: UserSettings = {
  theme: {
    mode: 'system',
    accentColor: '#0ea5e9', // Default to a blue shade
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
  },
  privacy: {
    shareHealthData: false,
    shareContactInfo: false,
    twoFactorAuth: false,
  },
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(undefined);

export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Load user settings from database when user profile is available
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Get user settings from the database
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          console.error('Error loading user settings:', error);
          throw error;
        }

        if (data) {
          // If we have settings in the database, use them with proper type casting
          const themeData = data.theme as Record<string, unknown>;
          const notificationsData = data.notifications as Record<string, unknown>;
          const privacyData = data.privacy as Record<string, unknown>;
          
          setSettings({
            theme: {
              mode: (themeData.mode as 'light' | 'dark' | 'system') || defaultSettings.theme.mode,
              accentColor: (themeData.accentColor as string) || defaultSettings.theme.accentColor,
            },
            notifications: {
              email: (notificationsData.email as boolean) ?? defaultSettings.notifications.email,
              push: (notificationsData.push as boolean) ?? defaultSettings.notifications.push,
              sms: (notificationsData.sms as boolean) ?? defaultSettings.notifications.sms,
            },
            privacy: {
              shareHealthData: (privacyData.shareHealthData as boolean) ?? defaultSettings.privacy.shareHealthData,
              shareContactInfo: (privacyData.shareContactInfo as boolean) ?? defaultSettings.privacy.shareContactInfo,
              twoFactorAuth: (privacyData.twoFactorAuth as boolean) ?? defaultSettings.privacy.twoFactorAuth,
            },
          });
        } else {
          // If no settings found, create default settings
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              theme: defaultSettings.theme,
              notifications: defaultSettings.notifications,
              privacy: defaultSettings.privacy,
            });
            
          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error('Failed to load or create user settings:', error);
        toast({
          title: "Settings Error",
          description: "Could not load your settings. Using defaults.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, [isAuthenticated, user, toast]);

  const updateTheme = async (theme: Partial<ThemeSettings>) => {
    if (!user) return;
    
    try {
      const updatedTheme = { ...settings.theme, ...theme };
      
      // Update in database
      const { error } = await supabase
        .from('user_settings')
        .update({ theme: updatedTheme })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        theme: updatedTheme,
      }));
      
      toast({
        title: "Theme Updated",
        description: "Your display preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your theme settings.",
        variant: "destructive",
      });
    }
  };

  const updateNotificationPreferences = async (prefs: Partial<NotificationPreferences>) => {
    if (!user) return;
    
    try {
      const updatedNotifications = { ...settings.notifications, ...prefs };
      
      const { error } = await supabase
        .from('user_settings')
        .update({ notifications: updatedNotifications })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setSettings(prev => ({
        ...prev,
        notifications: updatedNotifications,
      }));
      
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your notification settings.",
        variant: "destructive",
      });
    }
  };

  const updatePrivacySettings = async (privacySettings: Partial<PrivacySettings>) => {
    if (!user) return;
    
    try {
      const updatedPrivacy = { ...settings.privacy, ...privacySettings };
      
      const { error } = await supabase
        .from('user_settings')
        .update({ privacy: updatedPrivacy })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setSettings(prev => ({
        ...prev,
        privacy: updatedPrivacy,
      }));
      
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved.",
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Update Failed",
        description: "Could not update your privacy settings.",
        variant: "destructive",
      });
    }
  };

  const saveProfileInfo = async (profileData: { firstName?: string; lastName?: string; email?: string }) => {
    if (!user) return;
    
    try {
      // Only update fields that were provided
      const updateData: any = {};
      if (profileData.firstName !== undefined) updateData.first_name = profileData.firstName;
      if (profileData.lastName !== undefined) updateData.last_name = profileData.lastName;
      
      // Update profile in the database
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Handle email update separately if provided (requires auth update)
      if (profileData.email !== undefined && profileData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profileData.email,
        });
        
        if (emailError) throw emailError;
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Could not update your profile information.",
        variant: "destructive",
      });
    }
  };

  const value = {
    settings,
    isLoading,
    updateTheme,
    updateNotificationPreferences,
    updatePrivacySettings,
    saveProfileInfo,
  };

  return <UserSettingsContext.Provider value={value}>{children}</UserSettingsContext.Provider>;
};

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};
