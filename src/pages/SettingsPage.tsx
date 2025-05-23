
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ProfileSettings from '@/components/settings/ProfileSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import { Shield } from 'lucide-react';
import { useUserSettings } from '@/contexts/UserSettingsContext';

const SettingsPage = () => {
  const { isLoading } = useUserSettings();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-slate-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-slate-800/50 p-1">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings />
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6">
          <AppearanceSettings />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-6">
          <PrivacySettings />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <SecuritySettings />
        </TabsContent>
      </Tabs>

      <Card className="mt-6 border-amber-500/20 bg-amber-500/5">
        <CardHeader className="flex flex-row items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle className="text-amber-500">Creator Access Mode</CardTitle>
            <CardDescription>
              You are viewing the application in Creator Access Mode. All settings are accessible.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default SettingsPage;
