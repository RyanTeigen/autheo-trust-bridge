
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
