
export interface AtomicValue {
  data_type: string;
  value: number | string;
  unit?: string;
  metadata?: Record<string, any>;
}

export interface AtomicDataPoint {
  id: string;
  owner_id: string;
  record_id: string;
  data_type: string;
  enc_value: string;
  unit?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AtomicStoreResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface AtomicServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AtomicDecompositionResult {
  success: boolean;
  atomicValues?: AtomicValue[];
  atomicCount?: number;
  error?: string;
}

export interface HomomorphicAnalyticsData {
  dataType: string;
  count: number;
  averageValue?: number;
  encryptedValues?: string[];
  metadata?: any[];
  trends?: {
    period: string;
    value: number;
  }[];
}
