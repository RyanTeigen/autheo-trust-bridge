
import { Medication, HealthRecord, Diagnosis, Immunization, MedicalTest, Allergy, HealthMetrics } from '@/contexts/HealthRecordsContext';

export interface InsuranceInfo {
  provider: string;
  memberID: string;
  groupNumber: string;
  planType: string;
  verified: boolean;
}

export interface TransactionInfo {
  id: string;
  amount: number;
  fee: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  autheoCoinsUsed: number;
}

export interface AutheoCoinInfo {
  balance: number;
  conversionRate: number; // USD to Autheo coin rate
}

export interface WalletData {
  balance: number;
  transactions: TransactionInfo[];
  insurance: InsuranceInfo;
  healthRecords: {
    medications: Medication[];
    diagnoses: Diagnosis[];
    immunizations: Immunization[];
    tests: MedicalTest[];
    allergies: Allergy[];
    metrics: HealthMetrics[];
  }
}

export interface DataAccessContract {
  id: string;
  recipientId: string;
  recipientName: string;
  dataTypes: string[];
  accessLevel: 'read' | 'write' | 'admin';
  startDate: string;
  endDate?: string;
  status: 'active' | 'pending' | 'revoked' | 'expired';
}

export interface WalletFilter {
  searchQuery: string;
  category: string;
  status: 'all' | 'shared' | 'private' | 'recent';
}

export interface WalletActivity {
  id: string;
  type: 'access' | 'transaction' | 'contract' | 'auth';
  description: string;
  timestamp: string;
  relatedEntity?: string;
  status: 'success' | 'pending' | 'failed';
}
