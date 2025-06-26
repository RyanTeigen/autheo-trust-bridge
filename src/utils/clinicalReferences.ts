
export interface ClinicalRange {
  min: number;
  max: number;
  label: string;
  color: string;
}

export interface VitalReference {
  normal: ClinicalRange;
  borderline?: ClinicalRange;
  high: ClinicalRange;
  low: ClinicalRange;
  unit: string;
  description: string;
}

export const CLINICAL_REFERENCES: Record<string, VitalReference> = {
  glucose: {
    normal: { min: 70, max: 99, label: 'Normal', color: '#10B981' },
    borderline: { min: 100, max: 125, label: 'Pre-diabetic', color: '#F59E0B' },
    high: { min: 126, max: 400, label: 'High', color: '#EF4444' },
    low: { min: 0, max: 69, label: 'Low', color: '#EF4444' },
    unit: 'mg/dL',
    description: 'Blood glucose levels'
  },
  heart_rate: {
    normal: { min: 60, max: 100, label: 'Normal', color: '#10B981' },
    high: { min: 101, max: 200, label: 'High', color: '#EF4444' },
    low: { min: 0, max: 59, label: 'Low', color: '#F59E0B' },
    unit: 'bpm',
    description: 'Heart rate (beats per minute)'
  },
  systolic_bp: {
    normal: { min: 90, max: 119, label: 'Normal', color: '#10B981' },
    borderline: { min: 120, max: 139, label: 'Elevated', color: '#F59E0B' },
    high: { min: 140, max: 200, label: 'High', color: '#EF4444' },
    low: { min: 0, max: 89, label: 'Low', color: '#EF4444' },
    unit: 'mmHg',
    description: 'Systolic blood pressure'
  },
  diastolic_bp: {
    normal: { min: 60, max: 79, label: 'Normal', color: '#10B981' },
    borderline: { min: 80, max: 89, label: 'Elevated', color: '#F59E0B' },
    high: { min: 90, max: 120, label: 'High', color: '#EF4444' },
    low: { min: 0, max: 59, label: 'Low', color: '#EF4444' },
    unit: 'mmHg',
    description: 'Diastolic blood pressure'
  }
};

export function getVitalStatus(value: number, vitalType: string): {
  range: ClinicalRange;
  status: 'normal' | 'borderline' | 'high' | 'low';
} {
  const reference = CLINICAL_REFERENCES[vitalType];
  if (!reference) {
    return { range: reference?.normal || { min: 0, max: 100, label: 'Unknown', color: '#6B7280' }, status: 'normal' };
  }

  if (value >= reference.normal.min && value <= reference.normal.max) {
    return { range: reference.normal, status: 'normal' };
  }
  
  if (reference.borderline && value >= reference.borderline.min && value <= reference.borderline.max) {
    return { range: reference.borderline, status: 'borderline' };
  }
  
  if (value >= reference.high.min) {
    return { range: reference.high, status: 'high' };
  }
  
  return { range: reference.low, status: 'low' };
}

export function getLatestVitalTrend(data: Array<{ value: number }>): 'improving' | 'worsening' | 'stable' | null {
  if (data.length < 2) return null;
  
  const recent = data.slice(-3);
  if (recent.length < 2) return null;
  
  const trend = recent[recent.length - 1].value - recent[0].value;
  const threshold = Math.abs(recent[0].value * 0.05); // 5% threshold
  
  if (Math.abs(trend) < threshold) return 'stable';
  return trend > 0 ? 'worsening' : 'improving';
}
