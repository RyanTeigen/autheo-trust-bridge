import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  Clock,
  CheckCircle,
  Settings,
  Smartphone
} from 'lucide-react';

interface NotificationSettings {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  urgency_override: boolean;
}

interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  is_enabled: boolean;
  settings: NotificationSettings;
  created_at: string;
  updated_at: string;
}

const AccessRequestNotifications: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState<NotificationSettings>({
    email_enabled: true,
    sms_enabled: false,
    push_enabled: true,
    notification_frequency: 'immediate',
    urgency_override: true
  });

  useEffect(() => {
    if (user) {
      fetchNotificationPreferences();
    }
  }, [user]);

  const fetchNotificationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.notifications) {
        const notificationSettings = data.notifications as any as NotificationSettings;
        setLocalSettings(notificationSettings);
        setPreferences({
          id: data.id,
          user_id: data.user_id,
          notification_type: 'access_requests',
          is_enabled: true,
          settings: notificationSettings,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      if (preferences) {
        // Update existing preferences
        const { error } = await supabase
          .from('user_settings')
          .update({
            notifications: localSettings as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', preferences.id);

        if (error) throw error;
      } else {
        // Create new preferences
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user?.id,
            notifications: localSettings as any,
            privacy: {},
            theme: {}
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Notification preferences saved successfully",
      });

      fetchNotificationPreferences();
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Configure how you want to be notified about access requests
        </p>
      </div>

      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          Stay informed about access requests to your medical records. You can customize 
          when and how you receive notifications.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-blue-500" />
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={localSettings.email_enabled}
              onCheckedChange={(checked) => updateSetting('email_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-green-500" />
              <div>
                <Label className="text-sm font-medium">SMS Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive text messages (requires phone number)</p>
              </div>
            </div>
            <Switch
              checked={localSettings.sms_enabled}
              onCheckedChange={(checked) => updateSetting('sms_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-purple-500" />
              <div>
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Browser push notifications</p>
              </div>
            </div>
            <Switch
              checked={localSettings.push_enabled}
              onCheckedChange={(checked) => updateSetting('push_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timing & Frequency
          </CardTitle>
          <CardDescription>
            Control when and how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Notification Frequency</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="immediate"
                  name="frequency"
                  checked={localSettings.notification_frequency === 'immediate'}
                  onChange={() => updateSetting('notification_frequency', 'immediate')}
                  className="w-4 h-4"
                />
                <Label htmlFor="immediate" className="text-sm">Immediate</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="hourly"
                  name="frequency"
                  checked={localSettings.notification_frequency === 'hourly'}
                  onChange={() => updateSetting('notification_frequency', 'hourly')}
                  className="w-4 h-4"
                />
                <Label htmlFor="hourly" className="text-sm">Hourly digest</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="daily"
                  name="frequency"
                  checked={localSettings.notification_frequency === 'daily'}
                  onChange={() => updateSetting('notification_frequency', 'daily')}
                  className="w-4 h-4"
                />
                <Label htmlFor="daily" className="text-sm">Daily summary</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiet-start">Quiet Hours Start</Label>
              <Input
                id="quiet-start"
                type="time"
                value={localSettings.quiet_hours_start || '22:00'}
                onChange={(e) => updateSetting('quiet_hours_start', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="quiet-end">Quiet Hours End</Label>
              <Input
                id="quiet-end"
                type="time"
                value={localSettings.quiet_hours_end || '08:00'}
                onChange={(e) => updateSetting('quiet_hours_end', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Override for High Priority</Label>
              <p className="text-xs text-muted-foreground">
                Send immediate notifications for urgent requests even during quiet hours
              </p>
            </div>
            <Switch
              checked={localSettings.urgency_override}
              onCheckedChange={(checked) => updateSetting('urgency_override', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Examples of notifications you'll receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Bell className="h-4 w-4 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">New Access Request</p>
                <p className="text-xs text-muted-foreground">
                  When a healthcare provider requests access to your records
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">Enabled</Badge>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <Clock className="h-4 w-4 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Request Reminders</p>
                <p className="text-xs text-muted-foreground">
                  Reminders for pending requests that need your attention
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">Enabled</Badge>
            </div>
            
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Auto-Approval Confirmations</p>
                <p className="text-xs text-muted-foreground">
                  When requests are automatically approved based on your rules
                </p>
              </div>
              <Badge variant="outline" className="ml-auto">Enabled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
        <Button variant="outline" onClick={fetchNotificationPreferences}>
          Reset
        </Button>
      </div>
    </div>
  );
};

export default AccessRequestNotifications;