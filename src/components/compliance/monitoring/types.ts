
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

export interface RiskAssessment {
  riskScore: number; // 0-100, higher is riskier
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendations: string[];
  lastUpdated: string;
  trends: {
    label: string;
    previous: number;
    current: number;
  }[];
}

export interface UserBehaviorMetric {
  userId: string;
  username: string;
  role: string;
  accessCount: number;
  riskScore: number;
  anomalyLevel: number;
  lastActivity: string;
}
