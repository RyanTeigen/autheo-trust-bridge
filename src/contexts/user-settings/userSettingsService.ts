import { supabase } from '@/integrations/supabase/client';
import { UserSettings, ThemeSettings, NotificationPreferences, PrivacySettings, JsonRecord } from './types';
import { defaultSettings } from './defaultSettings';

export async function fetchUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error loading user settings:', error);
    throw error;
  }

  if (!data) return null;

  // Convert from JSON to our TypeScript types
  const themeData = data.theme as Record<string, unknown>;
  const notificationsData = data.notifications as Record<string, unknown>;
  const privacyData = data.privacy as Record<string, unknown>;
  
  return {
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
  };
}

export async function createDefaultUserSettings(userId: string): Promise<void> {
  // Convert settings objects to JsonRecord to satisfy TypeScript
  const themeData = defaultSettings.theme as unknown as JsonRecord;
  const notificationsData = defaultSettings.notifications as unknown as JsonRecord;
  const privacyData = defaultSettings.privacy as unknown as JsonRecord;
  
  // Fix: Pass an array with a single object to insert as required by Supabase
  const { error } = await supabase
    .from('user_settings')
    .insert([{
      user_id: userId,
      theme: themeData,
      notifications: notificationsData,
      privacy: privacyData,
    }]);
    
  if (error) throw error;
}

export async function updateUserTheme(userId: string, theme: Partial<ThemeSettings>, currentTheme: ThemeSettings): Promise<void> {
  const updatedTheme = { ...currentTheme, ...theme };
  
  const { error } = await supabase
    .from('user_settings')
    .update({ theme: updatedTheme })
    .eq('user_id', userId);
    
  if (error) throw error;
}

export async function updateUserNotifications(
  userId: string, 
  prefs: Partial<NotificationPreferences>, 
  currentNotifications: NotificationPreferences
): Promise<void> {
  const updatedNotifications = { ...currentNotifications, ...prefs };
  
  const { error } = await supabase
    .from('user_settings')
    .update({ notifications: updatedNotifications })
    .eq('user_id', userId);
    
  if (error) throw error;
}

export async function updateUserPrivacy(
  userId: string,
  privacySettings: Partial<PrivacySettings>,
  currentPrivacy: PrivacySettings
): Promise<void> {
  const updatedPrivacy = { ...currentPrivacy, ...privacySettings };
  
  const { error } = await supabase
    .from('user_settings')
    .update({ privacy: updatedPrivacy })
    .eq('user_id', userId);
    
  if (error) throw error;
}

export async function updateUserProfile(
  userId: string,
  profileData: { firstName?: string; lastName?: string; email?: string }
): Promise<void> {
  // Only update fields that were provided
  const updateData: Record<string, string> = {};
  if (profileData.firstName !== undefined) updateData.first_name = profileData.firstName;
  if (profileData.lastName !== undefined) updateData.last_name = profileData.lastName;
  
  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
      
    if (error) throw error;
  }
  
  // Handle email update separately if provided (requires auth update)
  if (profileData.email !== undefined) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: profileData.email,
    });
    
    if (emailError) throw emailError;
  }
}
