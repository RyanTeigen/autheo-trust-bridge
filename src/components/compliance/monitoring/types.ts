
export interface SecurityAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  source: string;
  resolved: boolean;
}

export interface AccessPattern {
  hour: string;
  count: number;
  anomalyScore: number; // 0 = normal, higher values indicate anomaly severity
}
