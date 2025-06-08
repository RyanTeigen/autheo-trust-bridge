
// Centralized type definitions for the monitoring system

export interface SystemMetric {
  id: string;
  metricType: 'performance' | 'security' | 'usage' | 'error' | 'health';
  value: number;
  unit: string;
  timestamp: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  alertType: 'system' | 'security' | 'performance' | 'data';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
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

export interface MonitoringThresholds {
  errorRate: number;
  responseTime: number;
  memoryUsage: number;
  diskUsage: number;
  failedLogins: number;
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
