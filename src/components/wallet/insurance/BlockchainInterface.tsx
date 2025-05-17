
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Coins, Check, Clock } from 'lucide-react';

interface Transaction {
  id: string;
  timestamp: string;
  type: 'payment' | 'verification' | 'contract';
  description: string;
  hash: string;
  status: 'pending' | 'confirmed';
}

const BlockchainInterface: React.FC = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading blockchain transaction data
    setTimeout(() => {
      setTransactions([
        {
          id: 'tx-1',
          timestamp: new Date().toISOString(),
          type: 'payment',
          description: 'Co-pay payment for Dr. Chen visit',
          hash: '0x8F7d42198071CF7b03A2e63CD8D412905C5615',
          status: 'confirmed'
        },
        {
          id: 'tx-2',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          type: 'verification',
          description: 'Insurance verification request',
          hash: '0x5A2dF731Be1788dd69Bc89288F6309d1',
          status: 'confirmed'
        },
        {
          id: 'tx-3',
          timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          type: 'contract',
          description: 'New payment contract creation',
          hash: '0x3D2c9Ba1C1cDB65Cc43847e7F7773E',
          status: 'pending'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);
  
  const handleRefresh = () => {
    setLoading(true);
    
    toast({
      title: "Refreshing blockchain data",
      description: "Fetching the latest transactions from the blockchain.",
    });
    
    // Simulate refreshing data
    setTimeout(() => {
      const newTransaction = {
        id: `tx-${transactions.length + 1}`,
        timestamp: new Date().toISOString(),
        type: Math.random() > 0.5 ? 'verification' : 'contract',
        description: Math.random() > 0.5 ? 'Insurance eligibility check' : 'Contract terms update',
        hash: `0x${Math.random().toString(16).slice(2, 42)}`,
        status: 'pending'
      };
      
      setTransactions([newTransaction, ...transactions]);
      setLoading(false);
      
      toast({
        title: "Blockchain data updated",
        description: "Successfully fetched the latest transactions.",
      });
    }, 1500);
  };
  
  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'payment':
        return <Coins className="h-4 w-4 text-green-500" />;
      case 'verification':
        return <Check className="h-4 w-4 text-blue-500" />;
      case 'contract':
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Coins className="h-5 w-5 text-autheo-primary" />
          Blockchain Transactions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 text-sm">
        {loading ? (
          <div className="py-4 flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="h-8 w-8 mx-auto bg-slate-200 rounded-full mb-2"></div>
              <p className="text-xs text-slate-500">Syncing with blockchain...</p>
            </div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map(tx => (
              <div key={tx.id} className="border rounded-lg p-2.5 hover:bg-slate-50 transition-colors duration-200">
                <div className="flex items-center gap-2">
                  {getTransactionIcon(tx.type)}
                  <div className="flex-grow">
                    <div className="font-medium">{tx.description}</div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-xs text-slate-500">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="text-xs">
                        {tx.status === 'confirmed' ? 
                          <span className="text-green-600">Confirmed</span> : 
                          <span className="text-amber-600">Pending</span>}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 text-xs text-slate-600 font-mono bg-slate-50 p-1 rounded overflow-x-auto">
                  {tx.hash}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <p>No blockchain transactions yet</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Syncing...' : 'Refresh Blockchain Data'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlockchainInterface;
