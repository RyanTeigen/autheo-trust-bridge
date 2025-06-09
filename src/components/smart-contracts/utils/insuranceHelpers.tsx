
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FileText, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { InsuranceContract } from '@/services/blockchain/SmartContractsService';

export const getStatusBadge = (status: InsuranceContract['status']) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-600 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>;
    case 'draft':
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Draft</Badge>;
    case 'executed':
      return <Badge className="bg-blue-600 hover:bg-blue-600">Executed</Badge>;
    case 'expired':
      return <Badge variant="secondary">Expired</Badge>;
    case 'terminated':
      return <Badge variant="destructive">Terminated</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export const getContractTypeIcon = (type: InsuranceContract['contractType']) => {
  switch (type) {
    case 'claim_processing':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'payment_automation':
      return <DollarSign className="h-4 w-4 text-green-500" />;
    case 'authorization':
      return <CheckCircle className="h-4 w-4 text-purple-500" />;
    case 'coverage_verification':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};
