import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Clock, Users, AlertTriangle, X } from 'lucide-react';

interface ConsentPreferences {
  id?: string;
  auto_approve_appointments: boolean;
  default_access_duration_hours: number;
  trusted_providers: string[];
  appointment_types_auto_approve: string[];
  emergency_auto_approve: boolean;
  notification_preferences: {
    email: boolean;
    in_app: boolean;
  };
}

const appointmentTypes = [
  'Consultation',
  'Follow-up',
  'Emergency',
  'Surgery',
  'Lab Results',
  'Vaccination',
  'Physical Therapy',
  'Mental Health'
];

const ConsentPreferencesTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    auto_approve_appointments: false,
    default_access_duration_hours: 24,
    trusted_providers: [],
    appointment_types_auto_approve: [],
    emergency_auto_approve: true,
    notification_preferences: {
      email: true,
      in_app: true
    }
  });

  useEffect(() => {
    if (user) {
      fetchPatientIdAndPreferences();
    }
  }, [user]);

  const fetchPatientIdAndPreferences = async () => {
    try {
      // First get the patient ID
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (patientError) {
        console.error('Error fetching patient:', patientError);
        return;
      }

      setPatientId(patientData.id);

      // Then fetch preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('patient_consent_preferences')
        .select('*')
        .eq('patient_id', patientData.id)
        .maybeSingle();

      if (prefsError) {
        console.error('Error fetching preferences:', prefsError);
        return;
      }

      if (prefsData) {
        setPreferences({
          id: prefsData.id,
          auto_approve_appointments: prefsData.auto_approve_appointments,
          default_access_duration_hours: prefsData.default_access_duration_hours,
          trusted_providers: prefsData.trusted_providers || [],
          appointment_types_auto_approve: prefsData.appointment_types_auto_approve || [],
          emergency_auto_approve: prefsData.emergency_auto_approve,
          notification_preferences: (prefsData.notification_preferences as { email: boolean; in_app: boolean }) || {
            email: true,
            in_app: true
          }
        });
      }
    } catch (error) {
      console.error('Error in fetchPatientIdAndPreferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load consent preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!patientId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('patient_consent_preferences')
        .upsert({
          patient_id: patientId,
          auto_approve_appointments: preferences.auto_approve_appointments,
          default_access_duration_hours: preferences.default_access_duration_hours,
          trusted_providers: preferences.trusted_providers,
          appointment_types_auto_approve: preferences.appointment_types_auto_approve,
          emergency_auto_approve: preferences.emergency_auto_approve,
          notification_preferences: preferences.notification_preferences
        });

      if (error) throw error;

      toast({
        title: 'Preferences saved',
        description: 'Your consent preferences have been updated successfully'
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save consent preferences',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleAppointmentType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      appointment_types_auto_approve: prev.appointment_types_auto_approve.includes(type)
        ? prev.appointment_types_auto_approve.filter(t => t !== type)
        : [...prev.appointment_types_auto_approve, type]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-slate-800/50 animate-pulse rounded-lg"></div>
        <div className="h-48 bg-slate-800/50 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-autheo-primary">
            <Shield className="h-5 w-5" />
            Consent Preferences
          </CardTitle>
          <CardDescription className="text-slate-300">
            Configure automatic access approvals for appointment-based record sharing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-approve toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-slate-200">Auto-approve appointments</Label>
                <p className="text-sm text-slate-400">
                  Automatically grant access to medical records when providers schedule appointments
                </p>
              </div>
              <Switch
                checked={preferences.auto_approve_appointments}
                onCheckedChange={(checked) => 
                  setPreferences(prev => ({ ...prev, auto_approve_appointments: checked }))
                }
              />
            </div>

            {preferences.auto_approve_appointments && (
              <Alert className="bg-blue-950/50 border-blue-700">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-blue-200">
                  When enabled, providers will automatically get access to your records for scheduled appointments based on your preferences below.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Access duration */}
          <div className="space-y-2">
            <Label className="text-slate-200 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Default Access Duration (hours)
            </Label>
            <Input
              type="number"
              min="1"
              max="168"
              value={preferences.default_access_duration_hours}
              onChange={(e) => 
                setPreferences(prev => ({ 
                  ...prev, 
                  default_access_duration_hours: parseInt(e.target.value) || 24 
                }))
              }
              className="bg-slate-700 border-slate-600 text-slate-100"
            />
            <p className="text-sm text-slate-400">
              How long providers should have access to your records after appointments
            </p>
          </div>

          {/* Emergency auto-approve */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-slate-200">Emergency auto-approve</Label>
              <p className="text-sm text-slate-400">
                Automatically approve access for emergency appointments
              </p>
            </div>
            <Switch
              checked={preferences.emergency_auto_approve}
              onCheckedChange={(checked) => 
                setPreferences(prev => ({ ...prev, emergency_auto_approve: checked }))
              }
            />
          </div>

          {/* Appointment types auto-approve */}
          <div className="space-y-3">
            <Label className="text-slate-200">Auto-approve appointment types</Label>
            <p className="text-sm text-slate-400">
              Select which appointment types should automatically grant access
            </p>
            <div className="flex flex-wrap gap-2">
              {appointmentTypes.map((type) => (
                <Badge
                  key={type}
                  variant={preferences.appointment_types_auto_approve.includes(type) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    preferences.appointment_types_auto_approve.includes(type)
                      ? 'bg-autheo-primary text-autheo-dark hover:bg-autheo-primary/80'
                      : 'border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                  onClick={() => toggleAppointmentType(type)}
                >
                  {type}
                  {preferences.appointment_types_auto_approve.includes(type) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Notification preferences */}
          <div className="space-y-3">
            <Label className="text-slate-200">Notification Preferences</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Email notifications</span>
                <Switch
                  checked={preferences.notification_preferences.email}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ 
                      ...prev, 
                      notification_preferences: { 
                        ...prev.notification_preferences, 
                        email: checked 
                      }
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">In-app notifications</span>
                <Switch
                  checked={preferences.notification_preferences.in_app}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ 
                      ...prev, 
                      notification_preferences: { 
                        ...prev.notification_preferences, 
                        in_app: checked 
                      }
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={savePreferences}
            disabled={saving}
            className="bg-autheo-primary hover:bg-autheo-primary/90 text-autheo-dark"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsentPreferencesTab;