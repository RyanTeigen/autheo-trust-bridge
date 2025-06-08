
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  accentColor: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
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
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface UserSettingsContextType {
  settings: UserSettings;
  loading: boolean;
  isLoading: boolean;
  updateThemeSettings: (theme: Partial<ThemeSettings>) => Promise<void>;
  updateTheme: (theme: Partial<ThemeSettings>) => Promise<void>;
  updateNotificationSettings: (notifications: Partial<NotificationSettings>) => Promise<void>;
  updateNotificationPreferences: (notifications: Partial<NotificationSettings>) => Promise<void>;
  updatePrivacySettings: (privacy: Partial<PrivacySettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  saveProfileInfo: (profileData: { firstName?: string; lastName?: string; email?: string }) => Promise<void>;
}

export type JsonRecord = Record<string, any>;
