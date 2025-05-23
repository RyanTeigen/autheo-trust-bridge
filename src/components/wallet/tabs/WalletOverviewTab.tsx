
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CircleDollarSign,
  ArrowRightLeft,
  PiggyBank,
} from 'lucide-react';
import WalletOverview from '../WalletOverview';
import { useToast } from '@/hooks/use-toast';

const WalletOverviewTab: React.FC = () => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(100);
  
  const handleTransactionDemo = () => {
    toast({
      title: "Transaction Processing",
      description: "Demonstrating secure blockchain transaction...",
    });
    
    setTimeout(() => {
      toast({
        title: "Transaction Complete",
        description: "5 THEO coins transferred successfully.",
      });
      setBalance(prev => prev - 5);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-800/50 border-slate-700/50 col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">THEO Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 bg-autheo-primary/20 p-3 rounded-full">
                <CircleDollarSign className="h-6 w-6 text-autheo-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-autheo-primary">{balance}</div>
                <div className="text-xs text-slate-400">THEO Coins</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button 
                size="sm" 
                className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-xs"
                onClick={handleTransactionDemo}
              >
                <ArrowRightLeft className="h-3 w-3 mr-1" /> Transfer
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-slate-700 text-xs hover:bg-slate-700/50"
              >
                <PiggyBank className="h-3 w-3 mr-1" /> Add Funds
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <WalletOverview removeBalanceCard={true} />
    </div>
  );
};

export default WalletOverviewTab;
