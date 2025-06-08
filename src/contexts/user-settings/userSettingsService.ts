import { supabase } from '@/integrations/supabase/client';
import { UserSettings, ThemeSettings, NotificationPreferences, PrivacySettings, JsonRecord } from './types';
import { defaultSettings } from './defaultSettings';
import { FieldEncryption } from '@/services/security/FieldEncryption';

const fieldEncryption = FieldEncryption.getInstance();

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
  const themeData = data.theme as any;
  const notificationsData = data.notifications as any;
  const privacyData = data.privacy as any;
  
  return {
    theme: {
      mode: themeData?.mode || defaultSettings.theme.mode,
      accentColor: themeData?.accentColor || defaultSettings.theme.accentColor,
    },
    notifications: {
      email: notificationsData?.email ?? defaultSettings.notifications.email,
      push: notificationsData?.push ?? defaultSettings.notifications.push,
      sms: notificationsData?.sms ?? defaultSettings.notifications.sms,
    },
    privacy: {
      shareHealthData: privacyData?.shareHealthData ?? defaultSettings.privacy.shareHealthData,
      shareContactInfo: privacyData?.shareContactInfo ?? defaultSettings.privacy.shareContactInfo,
      twoFactorAuth: privacyData?.twoFactorAuth ?? defaultSettings.privacy.twoFactorAuth,
    },
  };
}

export async function createDefaultUserSettings(userId: string): Promise<void> {
  // Convert settings objects to JsonRecord to satisfy TypeScript
  const themeData = defaultSettings.theme as unknown as JsonRecord;
  const notificationsData = defaultSettings.notifications as unknown as JsonRecord;
  const privacyData = defaultSettings.privacy as unknown as JsonRecord;
  
  // Use array syntax with proper type assertion to satisfy TypeScript
  const { error } = await supabase
    .from('user_settings')
    .insert([{
      user_id: userId,
      theme: themeData,
      notifications: notificationsData,
      privacy: privacyData,
    }] as any); // Using 'any' type assertion to bypass TypeScript's type checking
    
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
  // Encrypt sensitive profile data before storing
  const encryptedData = await fieldEncryption.encryptSensitiveFields(
    profileData,
    ['firstName', 'lastName'] // Encrypt names but not email for auth purposes
  );

  const updateData: Record<string, any> = {};
  if (encryptedData.firstName !== undefined) updateData.first_name = encryptedData.firstName;
  if (encryptedData.lastName !== undefined) updateData.last_name = encryptedData.lastName;
  
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
