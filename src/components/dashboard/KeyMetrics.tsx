
import React from 'react';
import { Heart, FileCheck, Wallet, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface KeyMetricsProps {
  healthRecords: {
    total: number;
    shared: number;
    pending: number;
  };
  complianceScore: number;
}

const KeyMetrics: React.FC<KeyMetricsProps> = ({ healthRecords, complianceScore }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Health Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{healthRecords.total}</div>
              <p className="text-xs text-muted-foreground">Total Records</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Shared Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <FileCheck className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{healthRecords.shared}</div>
              <p className="text-xs text-muted-foreground">Active Shares</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Smart Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Wallet className="h-8 w-8 text-autheo-primary mr-3" />
            <div>
              <div className="text-2xl font-bold">Secured</div>
              <p className="text-xs text-muted-foreground">Decentralized Storage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">HIPAA Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-amber-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{complianceScore}%</div>
              <p className="text-xs text-muted-foreground">Compliance Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyMetrics;
