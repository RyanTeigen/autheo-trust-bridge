import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, AlertTriangle, MessageSquare, Settings } from 'lucide-react';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const NotificationDemoCreator: React.FC = () => {
  const { createTestResultNotification, createCriticalUpdate, createProviderCommunication } = useEnhancedNotifications();
  const { toast } = useToast();

  const createDemoTestResult = async () => {
    try {
      // Get current user and patient ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) {
        toast({
          title: "Error",
          description: "Patient profile not found. Please set up your profile first.",
          variant: "destructive",
        });
        return;
      }

      // Create a demo provider if needed
      const { data: provider } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'provider')
        .limit(1)
        .single();

      const providerId = provider?.id || user.id; // Fallback to current user

      await createTestResultNotification({
        patient_id: patient.id,
        test_type: 'blood_test',
        test_name: 'Complete Blood Count (CBC)',
        result_status: 'abnormal',
        provider_id: providerId,
        result_summary: 'Some values are outside normal range',
        requires_action: true,
        action_required: 'Please schedule a follow-up appointment to discuss these results',
        priority_level: 'high'
      });

      toast({
        title: "Demo Created",
        description: "Test result notification created successfully",
      });
    } catch (error) {
      console.error('Error creating demo test result:', error);
      toast({
        title: "Error",
        description: "Failed to create demo test result",
        variant: "destructive",
      });
    }
  };

  const createDemoCriticalUpdate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) return;

      const { data: provider } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'provider')
        .limit(1)
        .single();

      const providerId = provider?.id || user.id;

      await createCriticalUpdate({
        patient_id: patient.id,
        provider_id: providerId,
        update_type: 'medication_change',
        title: '🚨 Important Medication Change',
        message: 'Your blood pressure medication dosage has been adjusted. Please start taking the new dosage immediately and monitor for any side effects.',
        severity_level: 'critical',
        requires_immediate_attention: true,
        acknowledgment_required: true,
        metadata: {
          medication: 'Lisinopril',
          old_dosage: '10mg',
          new_dosage: '20mg',
          reason: 'Blood pressure not adequately controlled'
        }
      });

      toast({
        title: "Demo Created",
        description: "Critical medical update created successfully",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Error creating demo critical update:', error);
      toast({
        title: "Error",
        description: "Failed to create demo critical update",
        variant: "destructive",
      });
    }
  };

  const createDemoProviderMessage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!patient) return;

      const { data: provider } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'provider')
        .limit(1)
        .single();

      const providerId = provider?.id || user.id;

      await createProviderCommunication({
        patient_id: patient.id,
        provider_id: providerId,
        communication_type: 'follow_up',
        subject: 'Post-Surgery Follow-up Instructions',
        message: 'Hi! I hope you\'re recovering well from your procedure. Please remember to take your antibiotics as prescribed and keep the wound dry. Schedule a follow-up appointment in 2 weeks.',
        priority: 'high',
        requires_response: true,
        response_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        metadata: {
          procedure: 'Appendectomy',
          surgery_date: '2024-01-15'
        }
      });

      toast({
        title: "Demo Created",
        description: "Provider communication created successfully",
      });
    } catch (error) {
      console.error('Error creating demo provider message:', error);
      toast({
        title: "Error",
        description: "Failed to create demo provider message",
        variant: "destructive",
      });
    }
  };

  const createDemoSystemNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('system_notifications')
        .insert([{
          user_id: user.id,
          notification_type: 'security_alert',
          title: '🔒 Security Update Required',
          message: 'We\'ve detected unusual activity on your account. Please review your recent login activity and update your password if necessary.',
          severity: 'warning',
          action_required: true,
          action_url: '/settings/security',
          action_text: 'Review Security Settings',
          metadata: {
            last_login: new Date().toISOString(),
            ip_address: '192.168.1.1',
            device: 'Chrome on Windows'
          }
        }]);

      if (error) throw error;

      toast({
        title: "Demo Created",
        description: "System notification created successfully",
      });
    } catch (error) {
      console.error('Error creating demo system notification:', error);
      toast({
        title: "Error",
        description: "Failed to create demo system notification",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Demo Creator
          <Badge variant="outline">Demo Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create demo notifications to test the enhanced notification system. These will appear in your notification center.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={createDemoTestResult}
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              <span className="font-medium">Test Result</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Create a blood test result notification with abnormal values requiring follow-up
            </span>
          </Button>

          <Button 
            onClick={createDemoCriticalUpdate}
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="font-medium">Critical Update</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Create a critical medication change notification requiring immediate attention
            </span>
          </Button>

          <Button 
            onClick={createDemoProviderMessage}
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Provider Message</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Create a follow-up message from your healthcare provider requiring response
            </span>
          </Button>

          <Button 
            onClick={createDemoSystemNotification}
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-warning" />
              <span className="font-medium">System Alert</span>
            </div>
            <span className="text-xs text-muted-foreground text-left">
              Create a security alert notification with action required
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};