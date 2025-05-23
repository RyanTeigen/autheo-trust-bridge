
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUserSettings } from '@/contexts/UserSettingsContext';

const PrivacySettings = () => {
  const { settings, updatePrivacySettings } = useUserSettings();
  const { privacy } = settings;

  const handleToggle = (key: keyof typeof privacy) => {
    updatePrivacySettings({ [key]: !privacy[key] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy</CardTitle>
        <CardDescription>
          Manage your data sharing preferences and privacy controls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Data Sharing</h3>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="health-data-sharing" className="font-medium">Health data sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow your healthcare providers to access your health records
                </p>
              </div>
              <Switch 
                id="health-data-sharing" 
                checked={privacy.shareHealthData}
                onCheckedChange={() => handleToggle('shareHealthData')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="contact-info-sharing" className="font-medium">Contact information sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow healthcare providers to view your contact information
                </p>
              </div>
              <Switch 
                id="contact-info-sharing"
                checked={privacy.shareContactInfo}
                onCheckedChange={() => handleToggle('shareContactInfo')}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Account Security</h3>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor" className="font-medium">Two-factor authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch 
                id="two-factor" 
                checked={privacy.twoFactorAuth}
                onCheckedChange={() => handleToggle('twoFactorAuth')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="login-history" className="font-medium">Login history</Label>
                <p className="text-sm text-muted-foreground">
                  Keep a record of devices that have logged into your account
                </p>
              </div>
              <Switch id="login-history" defaultChecked />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
