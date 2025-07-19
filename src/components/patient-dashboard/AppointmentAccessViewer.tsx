import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Clock, User, FileText, Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentAccess {
  id: string;
  appointment_id: string;
  access_granted: boolean;
  access_duration_hours: number;
  access_expires_at: string | null;
  clinical_justification: string | null;
  auto_granted: boolean;
  created_at: string;
  enhanced_appointments: {
    appointment_date: string;
    appointment_type: string;
    status: string;
    urgency_level: string;
    clinical_notes: string | null;
    access_request_status: string;
  }[] | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  }[] | null;
}

const AppointmentAccessViewer: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accessMappings, setAccessMappings] = useState<AppointmentAccess[]>([]);

  useEffect(() => {
    if (user) {
      fetchAppointmentAccess();
    }
  }, [user]);

  const fetchAppointmentAccess = async () => {
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

      // Then fetch appointment access mappings with related data
      const { data, error } = await supabase
        .from('appointment_access_mappings')
        .select(`
          *,
          enhanced_appointments (
            appointment_date,
            appointment_type,
            status,
            urgency_level,
            clinical_notes,
            access_request_status
          ),
          profiles:provider_id (
            first_name,
            last_name
          )
        `)
        .eq('patient_id', patientData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAccessMappings((data as unknown as AppointmentAccess[]) || []);
    } catch (error) {
      console.error('Error fetching appointment access:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointment access information',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (mapping: AppointmentAccess) => {
    if (mapping.access_granted) {
      return <CheckCircle className="h-4 w-4 text-green-400" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusText = (mapping: AppointmentAccess) => {
    if (mapping.access_granted) {
      return mapping.auto_granted ? 'Auto-approved' : 'Manually approved';
    } else {
      return 'Pending approval';
    }
  };

  const getStatusVariant = (mapping: AppointmentAccess) => {
    if (mapping.access_granted) {
      return mapping.auto_granted ? 'default' : 'secondary';
    } else {
      return 'outline';
    }
  };

  const isAccessExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-slate-800/50 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-autheo-primary">
            <Calendar className="h-5 w-5" />
            Appointment Access History
          </CardTitle>
          <CardDescription className="text-slate-300">
            View access permissions granted to providers through appointment scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accessMappings.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No appointment access history found</p>
              <p className="text-sm mt-2">Access permissions will appear here when providers schedule appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {accessMappings.map((mapping) => (
                <Card key={mapping.id} className="bg-slate-700/30 border-slate-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(mapping)}
                          <Badge variant={getStatusVariant(mapping)} className="text-xs">
                            {getStatusText(mapping)}
                          </Badge>
                          {mapping.enhanced_appointments?.[0]?.urgency_level === 'emergency' && (
                            <Badge variant="destructive" className="text-xs">
                              Emergency
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-300">
                                Dr. {mapping.profiles?.[0]?.first_name} {mapping.profiles?.[0]?.last_name}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-300">
                                {mapping.enhanced_appointments?.[0]?.appointment_date ? 
                                  format(new Date(mapping.enhanced_appointments[0].appointment_date), 'PPP p') : 
                                  'Date not available'
                                }
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-300">
                                {mapping.enhanced_appointments?.[0]?.appointment_type || 'Unknown type'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-300">
                                Access: {mapping.access_duration_hours}h duration
                              </span>
                            </div>

                            {mapping.access_expires_at && (
                              <div className="flex items-center gap-2 text-sm">
                                <Shield className="h-4 w-4 text-slate-400" />
                                <span className={`${isAccessExpired(mapping.access_expires_at) ? 'text-red-400' : 'text-slate-300'}`}>
                                  {isAccessExpired(mapping.access_expires_at) ? 'Expired: ' : 'Expires: '}
                                  {format(new Date(mapping.access_expires_at), 'PPP p')}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-slate-400">Status:</span>
                              <span className="text-slate-300">
                                {mapping.enhanced_appointments?.[0]?.status || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {mapping.clinical_justification && (
                          <div className="mt-3 p-2 bg-slate-800/50 rounded text-sm">
                            <span className="text-slate-400">Clinical justification: </span>
                            <span className="text-slate-300">{mapping.clinical_justification}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentAccessViewer;