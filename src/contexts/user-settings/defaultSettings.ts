
import { UserSettings } from './types';

export const defaultSettings: UserSettings = {
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
