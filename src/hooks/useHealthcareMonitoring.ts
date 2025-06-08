
import { useCallback } from 'react';
import { useSystemMonitoring } from './useSystemMonitoring';
import { useAuth } from '@/contexts/AuthContext';

export const useHealthcareMonitoring = () => {
  const { systemMonitor } = useSystemMonitoring();
  const { user } = useAuth();

  const trackVitalSigns = useCallback((vitalType: string, value: string, notes?: string) => {
    if (!user?.id) return;
    
    systemMonitor?.recordHealthcareEvent('vital_recorded', user.id, {
      vital_type: vitalType,
      value,
      notes,
      recorded_at: new Date().toISOString()
    });
  }, [systemMonitor, user?.id]);

  const trackMedicationTaken = useCallback((medicationName: string, dosage: string, scheduledTime: string) => {
    if (!user?.id) return;
    
    const actualTime = new Date().toISOString();
    const isOnTime = Math.abs(new Date(actualTime).getTime() - new Date(scheduledTime).getTime()) <= 30 * 60 * 1000; // 30 minutes tolerance

    systemMonitor?.recordHealthcareEvent('medication_taken', user.id, {
      medication_name: medicationName,
      dosage,
      scheduled_time: scheduledTime,
      actual_time: actualTime,
      on_time: isOnTime,
      delay_minutes: isOnTime ? 0 : Math.round((new Date(actualTime).getTime() - new Date(scheduledTime).getTime()) / 60000)
    });
  }, [systemMonitor, user?.id]);

  const trackMedicalAlert = useCallback((alertType: string, severity: 'low' | 'medium' | 'high', alertData: Record<string, any>) => {
    if (!user?.id) return;
    
    systemMonitor?.recordHealthcareEvent('alert_triggered', user.id, {
      alert_type: alertType,
      alert_data: alertData,
      requires_action: severity === 'high'
    }, severity);
  }, [systemMonitor, user?.id]);

  const trackAppointment = useCallback((appointmentType: string, providerId: string, appointmentData: Record<string, any>) => {
    if (!user?.id) return;
    
    systemMonitor?.recordHealthcareEvent('appointment_scheduled', user.id, {
      appointment_type: appointmentType,
      provider_id: providerId,
      ...appointmentData
    });
  }, [systemMonitor, user?.id]);

  return {
    trackVitalSigns,
    trackMedicationTaken,
    trackMedicalAlert,
    trackAppointment
  };
};
