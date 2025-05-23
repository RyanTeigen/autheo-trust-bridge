import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CircleDollarSign,
  Receipt,
  ShieldCheck,
  Wallet,
  ArrowRightLeft,
  PiggyBank,
  FileText,
  CalendarClock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletOverviewProps {
  removeBalanceCard?: boolean;
}

const WalletOverview: React.FC<WalletOverviewProps> = ({ removeBalanceCard = false }) => {
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
      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!removeBalanceCard && (
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
        )}
        
        <Card className={`bg-slate-800/50 border-slate-700/50 ${removeBalanceCard ? 'md:col-span-3' : 'md:col-span-2'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { 
                  id: 1, 
                  type: 'payment', 
                  description: 'Co-pay for Dr. Chen', 
                  date: '2 days ago',
                  amount: -25,
                  icon: Receipt
                },
                { 
                  id: 2, 
                  type: 'contract', 
                  description: 'Activated access contract', 
                  date: '5 days ago',
                  amount: -2,
                  icon: FileText
                },
                { 
                  id: 3, 
                  type: 'deposit', 
                  description: 'Added funds', 
                  date: '1 week ago',
                  amount: 50,
                  icon: Wallet
                }
              ].map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-2 rounded-md bg-slate-700/30">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-slate-700/50 mr-3">
                      <activity.icon className="h-4 w-4 text-autheo-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-200">{activity.description}</div>
                      <div className="text-xs text-slate-400">{activity.date}</div>
                    </div>
                  </div>
                  <div className={`font-medium ${activity.amount > 0 ? 'text-green-400' : 'text-slate-200'}`}>
                    {activity.amount > 0 ? '+' : ''}{activity.amount} AUTHEO
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Insurance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Blue Cross Blue Shield</span>
              <span className="text-autheo-primary font-medium">Active</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Next payment</span>
              <span>June 1, 2025</span>
            </div>
            <div className="border-t border-slate-700/50 pt-2 mt-2">
              <Button variant="link" className="text-autheo-primary p-0 h-auto text-xs">
                View details
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Smart Contracts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span>Active contracts</span>
              <span className="text-autheo-primary font-medium">2</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Next expiration</span>
              <span>June 30, 2025</span>
            </div>
            <div className="border-t border-slate-700/50 pt-2 mt-2">
              <Button variant="link" className="text-autheo-primary p-0 h-auto text-xs">
                Manage contracts
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Security Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                <span className="text-sm">Protected</span>
              </div>
              <span className="text-xs bg-green-400/20 text-green-400 px-2 py-0.5 rounded-full">
                100%
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Last security audit: 2 days ago
            </div>
            <div className="border-t border-slate-700/50 pt-2 mt-2">
              <Button variant="link" className="text-autheo-primary p-0 h-auto text-xs">
                View security settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Scheduled Transactions */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Upcoming Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                id: 1,
                description: "Insurance premium",
                date: "June 1, 2025",
                amount: 35
              },
              {
                id: 2,
                description: "Dr. Ramirez appointment",
                date: "June 12, 2025",
                amount: 20
              }
            ].map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-2 rounded-md bg-slate-700/30">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-slate-700/50 mr-3">
                    <CalendarClock className="h-4 w-4 text-autheo-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-200">{transaction.description}</div>
                    <div className="text-xs text-slate-400">{transaction.date}</div>
                  </div>
                </div>
                <div className="font-medium text-slate-200">
                  {transaction.amount} AUTHEO
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletOverview;
