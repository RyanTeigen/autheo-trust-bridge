
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserSettingsContext } from './UserSettingsContext';
import { UserSettings, ThemeSettings, NotificationPreferences, PrivacySettings } from './types';
import { defaultSettings } from './defaultSettings';
import {
  fetchUserSettings,
  createDefaultUserSettings,
  updateUserTheme,
  updateUserNotifications,
  updateUserPrivacy,
  updateUserProfile
} from './userSettingsService';

export const UserSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Load user settings from database when user profile is available
  useEffect(() => {
    const loadUserSettings = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const userSettings = await fetchUserSettings(user.id);
        
        if (userSettings) {
          // If we have settings in the database, use them
          setSettings(userSettings);
        } else {
          // If no settings found, create default settings
          await createDefaultUserSettings(user.id);
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
      await updateUserTheme(user.id, theme, settings.theme);
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        theme: { ...prev.theme, ...theme },
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
      await updateUserNotifications(user.id, prefs, settings.notifications);
      
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, ...prefs },
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
      await updateUserPrivacy(user.id, privacySettings, settings.privacy);
      
      setSettings(prev => ({
        ...prev,
        privacy: { ...prev.privacy, ...privacySettings },
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
      await updateUserProfile(user.id, profileData);
      
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
