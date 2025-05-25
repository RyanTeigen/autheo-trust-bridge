
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import { Bell, Heart, Calendar, Shield, Users } from 'lucide-react';

const NotificationSettings = () => {
  const { settings, updateNotificationPreferences } = useUserSettings();
  const { notifications } = settings;

  const handleToggle = (key: keyof typeof notifications) => {
    updateNotificationPreferences({ [key]: !notifications[key] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Communication Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Health & Medical Alerts
          </CardTitle>
          <CardDescription>
            Configure notifications for health-related events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="medication-reminders" className="font-medium">Medication reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about medication schedules and refills
                </p>
              </div>
              <Switch id="medication-reminders" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vital-alerts" className="font-medium">Vital sign alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts when vital signs are outside normal ranges
                </p>
              </div>
              <Switch id="vital-alerts" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="lab-results" className="font-medium">Lab results</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new lab results are available
                </p>
              </div>
              <Switch id="lab-results" defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Emergency alert frequency</Label>
              <Select defaultValue="immediate">
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="urgent">Within 15 minutes</SelectItem>
                  <SelectItem value="daily">Daily digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Appointments & Scheduling
          </CardTitle>
          <CardDescription>
            Manage appointment and scheduling notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            
            <div className="space-y-2">
              <Label>Reminder timing</Label>
              <Select defaultValue="24h">
                <SelectTrigger>
                  <SelectValue placeholder="When to remind" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hour before</SelectItem>
                  <SelectItem value="24h">24 hours before</SelectItem>
                  <SelectItem value="48h">2 days before</SelectItem>
                  <SelectItem value="week">1 week before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="cancellation-alerts" className="font-medium">Cancellation alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about appointment cancellations or changes
                </p>
              </div>
              <Switch id="cancellation-alerts" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Security & Access
          </CardTitle>
          <CardDescription>
            Security and data access notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="security-alerts" className="font-medium">Security alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified about important security events
                </p>
              </div>
              <Switch id="security-alerts" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="access-requests" className="font-medium">Data access requests</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when providers request access to your data
                </p>
              </div>
              <Switch id="access-requests" defaultChecked />
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
