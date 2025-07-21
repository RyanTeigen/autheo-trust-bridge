import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, TestTube, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { emailNotificationService } from '@/services/notifications/EmailNotificationService';

export const EmailNotificationSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(emailNotificationService.getSettings());
  const [newRecipient, setNewRecipient] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setSettings(emailNotificationService.getSettings());
  }, []);

  const updateSettings = (updates: Partial<typeof settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    emailNotificationService.updateSettings(newSettings);
    
    toast({
      title: "Settings Updated",
      description: "Email notification settings have been saved.",
    });
  };

  const addRecipient = () => {
    if (!newRecipient.trim()) return;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipient)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (settings.recipients.includes(newRecipient)) {
      toast({
        title: "Duplicate Email",
        description: "This email is already in the recipients list.",
        variant: "destructive",
      });
      return;
    }

    updateSettings({
      recipients: [...settings.recipients, newRecipient]
    });
    setNewRecipient('');
  };

  const removeRecipient = (email: string) => {
    updateSettings({
      recipients: settings.recipients.filter(r => r !== email)
    });
  };

  const testEmailConfiguration = async () => {
    setIsTesting(true);
    try {
      const success = await emailNotificationService.testEmailConfiguration();
      
      if (success) {
        toast({
          title: "Test Email Sent",
          description: "Check your inbox for the test email. It may take a few minutes to arrive.",
        });
      } else {
        toast({
          title: "Test Failed",
          description: "Failed to send test email. Please check your configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "An error occurred while sending the test email.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Notification Settings
        </CardTitle>
        <CardDescription>
          Configure automated email alerts for security events and compliance notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send automated emails for security alerts and compliance events
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => updateSettings({ enabled })}
          />
        </div>

        {/* Severity Threshold */}
        <div className="space-y-2">
          <Label>Minimum Severity Level</Label>
          <Select
            value={settings.severityThreshold}
            onValueChange={(value: 'critical' | 'high' | 'medium' | 'low') => 
              updateSettings({ severityThreshold: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical Only</SelectItem>
              <SelectItem value="high">High and Critical</SelectItem>
              <SelectItem value="medium">Medium, High, and Critical</SelectItem>
              <SelectItem value="low">All Severity Levels</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Only send emails for alerts at or above this severity level
          </p>
        </div>

        {/* Recipients */}
        <div className="space-y-4">
          <Label>Email Recipients</Label>
          
          {/* Add New Recipient */}
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
            />
            <Button onClick={addRecipient} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {/* Recipients List */}
          <div className="space-y-2">
            {settings.recipients.map((email, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRecipient(email)}
                  disabled={settings.recipients.length === 1}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {settings.recipients.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No recipients configured. Add an email address above.
              </p>
            )}
          </div>
        </div>

        {/* Compliance Officer */}
        <div className="space-y-2">
          <Label>Compliance Officer Email (Optional)</Label>
          <Input
            placeholder="compliance@healthcare.org"
            value={settings.complianceOfficer || ''}
            onChange={(e) => updateSettings({ complianceOfficer: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Additional recipient for compliance-related notifications
          </p>
        </div>

        {/* Test Configuration */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Test Email Configuration</h4>
              <p className="text-sm text-muted-foreground">
                Send a test email to verify your settings
              </p>
            </div>
            <Button
              onClick={testEmailConfiguration}
              disabled={isTesting || !settings.enabled || settings.recipients.length === 0}
              size="sm"
            >
              <TestTube className="w-4 h-4 mr-1" />
              {isTesting ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex gap-2 pt-2">
          <Badge variant={settings.enabled ? "default" : "secondary"}>
            {settings.enabled ? "Enabled" : "Disabled"}
          </Badge>
          <Badge variant={settings.recipients.length > 0 ? "default" : "destructive"}>
            {settings.recipients.length} Recipients
          </Badge>
          <Badge variant="outline">
            {settings.severityThreshold.charAt(0).toUpperCase() + settings.severityThreshold.slice(1)}+ Alerts
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};