
export interface AtomicDataPoint {
  id: string;
  owner_id: string;
  record_id: string;
  data_type: string;
  enc_value: string;
  unit?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AtomicValue {
  data_type: string;
  value: string | number;
  unit?: string;
  metadata?: any;
}

export interface AtomicServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AtomicStoreResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface AtomicDecompositionResult {
  success: boolean;
  atomicCount?: number;
  error?: string;
}

export interface HomomorphicAnalyticsData {
  dataType: string;
  encryptedValues: string[];
  metadata: any[];
  count: number;
}
