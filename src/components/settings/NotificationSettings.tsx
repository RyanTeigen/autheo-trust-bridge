
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUserSettings } from '@/contexts/UserSettingsContext';

const NotificationSettings = () => {
  const { settings, updateNotificationPreferences } = useUserSettings();
  const { notifications } = settings;

  const handleToggle = (key: keyof typeof notifications) => {
    updateNotificationPreferences({ [key]: !notifications[key] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Manage how you receive notifications and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Communication Channels</h3>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="font-medium">Email notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about appointments and important updates via email
                </p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={notifications.email}
                onCheckedChange={() => handleToggle('email')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications" className="font-medium">Push notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive app notifications when you're online
                </p>
              </div>
              <Switch 
                id="push-notifications" 
                checked={notifications.push}
                onCheckedChange={() => handleToggle('push')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications" className="font-medium">SMS notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text message notifications for critical alerts (may incur charges)
                </p>
              </div>
              <Switch 
                id="sms-notifications" 
                checked={notifications.sms}
                onCheckedChange={() => handleToggle('sms')}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="appointment-reminders" className="font-medium">Appointment reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming appointments
                </p>
              </div>
              <Switch id="appointment-reminders" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="record-updates" className="font-medium">Health record updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your health records are updated
                </p>
              </div>
              <Switch id="record-updates" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security-alerts" className="font-medium">Security alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about important security events
                </p>
              </div>
              <Switch id="security-alerts" defaultChecked />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
