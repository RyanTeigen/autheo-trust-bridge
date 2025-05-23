
import { Json } from '@/integrations/supabase/types';

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  accentColor: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface PrivacySettings {
  shareHealthData: boolean;
  shareContactInfo: boolean;
  twoFactorAuth: boolean;
}

export interface UserSettings {
  theme: ThemeSettings;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface UserSettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  updateTheme: (theme: Partial<ThemeSettings>) => Promise<void>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => Promise<void>;
  saveProfileInfo: (profileData: { firstName?: string; lastName?: string; email?: string }) => Promise<void>;
}

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export type JsonRecord = Record<string, unknown>;
