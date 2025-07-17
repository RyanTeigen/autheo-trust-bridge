export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SystemAlert {
  id: string;
  type: 'performance' | 'security' | 'error_rate' | 'availability' | 'capacity' | 'system_health' | 'system' | 'data';
  severity: AlertSeverity;
  message: string;
  context?: Record<string, any>;
  value?: number;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
}

export interface SystemMetric {
  id: string;
  metricType: 'performance' | 'security' | 'error' | 'usage' | 'health';
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  alertType: 'performance' | 'security' | 'error' | 'capacity' | 'availability' | 'system' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface UXEvent {
  id: string;
  type: 'ux_event';
  timestamp: string;
  event_type: 'interaction' | 'navigation' | 'error' | 'accessibility';
  data: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  user_agent: string;
  url: string;
}

export interface HealthcareEvent {
  id: string;
  type: 'healthcare_event';
  timestamp: string;
  event_type: 'vital_recorded' | 'medication_taken' | 'alert_triggered' | 'appointment_scheduled';
  patient_id: string;
  data: Record<string, any>;
  severity: 'low' | 'medium' | 'high';
  compliance_relevant: boolean;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  metrics: {
    errorRate: number;
    avgResponseTime: number;
    activeAlerts: number;
    criticalAlerts: number;
  };
}

export interface MonitoringThresholds {
  errorRate: { warning: number; critical: number };
  responseTime: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number };
  diskUsage: { warning: number; critical: number };
}