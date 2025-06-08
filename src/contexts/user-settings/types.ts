
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  accentColor: string;
}

export interface NotificationSettings {
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
