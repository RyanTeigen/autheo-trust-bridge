
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import WalletHeader from '@/components/wallet/WalletHeader';
import InsuranceInterface from '@/components/wallet/insurance/InsuranceInterface';
import InsuranceCard from '@/components/wallet/InsuranceCard';

interface SmartWalletTabProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const SmartWalletTab: React.FC<SmartWalletTabProps> = ({
  activeSection,
  onSectionChange
}) => {
  return (
    <div className="space-y-6">
      <Card className="border-slate-700 bg-slate-800/30">
        <CardHeader>
          <CardTitle>Smart Wallet</CardTitle>
          <CardDescription>
            Control and manage access to your health records and insurance information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <WalletHeader 
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
            
            {activeSection === 'insurance' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <InsuranceInterface />
                </div>
                <div className="lg:col-span-1">
                  <InsuranceCard />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="lg:col-span-1">
                  <p className="text-sm text-slate-400 mb-4">
                    Select another tab from the wallet header to access different features.
                  </p>
                  <InsuranceCard />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartWalletTab;
