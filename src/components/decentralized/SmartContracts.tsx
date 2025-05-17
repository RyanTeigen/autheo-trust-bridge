import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCode, Check, Clock, DollarSign, Coins, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TransactionInfo, AutheoCoinInfo } from '@/components/wallet/insurance/types';
import { supabase } from '@/integrations/supabase/client';

interface SmartContract {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'expired';
  expiresAt?: string;
}

const SmartContracts = () => {
  const { toast } = useToast();
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionDemo, setShowTransactionDemo] = useState(false);
  const [amount, setAmount] = useState('10.00');
  const [processing, setProcessing] = useState(false);
  
  // User's Autheo coin balance
  const [autheoInfo, setAutheoInfo] = useState<AutheoCoinInfo>({
    balance: 0,
    conversionRate: 10 // 1 USD = 10 Autheo coins
  });
  
  // Transaction history
  const [recentTransactions, setRecentTransactions] = useState<TransactionInfo[]>([]);
  
  // Load contracts and balance information from Supabase
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch smart contracts
        const { data: contractsData, error: contractsError } = await supabase
          .from('smart_contracts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (contractsError) throw contractsError;
        
        // Transform contract data to match our interface
        const formattedContracts = contractsData.map(contract => ({
          id: contract.id,
          name: contract.name,
          description: contract.description || '',
          status: contract.status as 'active' | 'pending' | 'expired',
          expiresAt: contract.expires_at
        }));
        
        setContracts(formattedContracts.length > 0 ? formattedContracts : [
          {
            id: 'contract1',
            name: 'Primary Care Access',
            description: 'Grants Dr. Emily Chen access to your medical records',
            status: 'active',
            expiresAt: '2025-06-30'
          },
          {
            id: 'contract2',
            name: 'Insurance Verification',
            description: 'Allows verification of insurance status without exposing details',
            status: 'active',
            expiresAt: '2025-12-31'
          },
          {
            id: 'contract3',
            name: 'Research Data Sharing',
            description: 'Anonymized data sharing for clinical research',
            status: 'pending'
          }
        ]);
        
        // Fetch Autheo balance
        const { data: balanceData, error: balanceError } = await supabase
          .from('autheo_balances')
          .select('balance')
          .maybeSingle();
          
        if (balanceError) throw balanceError;
        
        // Update Autheo info with balance from database or default
        setAutheoInfo({
          balance: balanceData?.balance || 100,
          conversionRate: 10 // Fixed rate for now
        });
        
        // Fetch recent transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (transactionsError) throw transactionsError;
        
        // Transform transaction data to match our interface
        const formattedTransactions = transactionsData.map(tx => ({
          id: tx.id,
          amount: tx.amount,
          fee: tx.fee,
          timestamp: tx.transaction_date || tx.created_at,
          status: tx.status as 'pending' | 'completed' | 'failed',
          description: tx.description || 'Healthcare transaction',
          autheoCoinsUsed: tx.autheo_coins_used
        }));
        
        setRecentTransactions(formattedTransactions.length > 0 ? formattedTransactions : [
          {
            id: 'tx001',
            amount: 25.00,
            fee: 0.50,
            timestamp: '2025-05-16T14:32:00Z',
            status: 'completed',
            description: 'Co-pay for Dr. Chen visit',
            autheoCoinsUsed: 250
          },
          {
            id: 'tx002',
            amount: 75.00,
            fee: 1.50,
            timestamp: '2025-05-10T09:15:00Z',
            status: 'completed',
            description: 'Lab test payment',
            autheoCoinsUsed: 750
          }
        ]);
      } catch (error) {
        console.error('Error loading wallet data:', error);
        toast({
          title: "Error loading data",
          description: "Could not load wallet data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [toast]);
  
  const handleActivate = async (id: string) => {
    try {
      // First, check if this is a demo contract or a real one from the database
      const isDemoContract = id.startsWith('contract');
      
      if (isDemoContract) {
        // For demo contracts, just update the local state
        setContracts(contracts.map(contract => 
          contract.id === id ? { ...contract, status: 'active' } : contract
        ));
      } else {
        // For real contracts, update in the database
        const { error } = await supabase
          .from('smart_contracts')
          .update({ status: 'active' })
          .eq('id', id);
          
        if (error) throw error;
        
        // Update the local state
        setContracts(contracts.map(contract => 
          contract.id === id ? { ...contract, status: 'active' } : contract
        ));
      }
      
      toast({
        title: "Smart Contract Activated",
        description: "The contract is now active on the blockchain",
      });
    } catch (error) {
      console.error('Error activating contract:', error);
      toast({
        title: "Activation Failed",
        description: "Could not activate the contract. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-500 border-red-500">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const processTransaction = async () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    // Calculate fee (2% of transaction)
    const fee = parseFloat((amountValue * 0.02).toFixed(2));
    const autheoCoinsNeeded = Math.round(amountValue * autheoInfo.conversionRate);
    
    try {
      // Check if user has enough Autheo coins
      if (autheoInfo.balance < autheoCoinsNeeded) {
        toast({
          title: "Insufficient Balance",
          description: `You need ${autheoCoinsNeeded} Autheo coins for this transaction`,
          variant: "destructive"
        });
        setProcessing(false);
        return;
      }
      
      // Create transaction in database
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          amount: amountValue,
          fee: fee,
          autheo_coins_used: autheoCoinsNeeded,
          status: 'completed',
          description: 'Healthcare service payment'
        })
        .select()
        .single();
        
      if (transactionError) throw transactionError;
      
      // Update user's Autheo balance
      const { error: balanceError } = await supabase
        .from('autheo_balances')
        .update({ 
          balance: autheoInfo.balance - autheoCoinsNeeded,
          updated_at: new Date().toISOString()
        });
        
      if (balanceError) throw balanceError;
      
      // Create new transaction object for state
      const newTransaction: TransactionInfo = {
        id: transactionData.id,
        amount: transactionData.amount,
        fee: transactionData.fee,
        timestamp: transactionData.transaction_date || transactionData.created_at,
        status: 'completed',
        description: transactionData.description || 'Healthcare service payment',
        autheoCoinsUsed: transactionData.autheo_coins_used
      };
      
      // Update transactions list
      setRecentTransactions([newTransaction, ...recentTransactions]);
      
      // Update Autheo coin balance
      setAutheoInfo({
        ...autheoInfo,
        balance: autheoInfo.balance - autheoCoinsNeeded
      });
      
      toast({
        title: "Transaction Complete",
        description: `$${amountValue} processed with $${fee} fee using Autheo coin`,
      });
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Failed",
        description: "An error occurred while processing your transaction",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
      setShowTransactionDemo(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileCode className="mr-2 h-5 w-5 text-primary" /> 
          Smart Contracts
        </CardTitle>
        <CardDescription>
          Automated agreements that govern how your health data is accessed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <div className="animate-pulse text-center">
              <div className="h-12 w-12 mx-auto bg-slate-200 rounded-full mb-2"></div>
              <p className="text-sm text-slate-500">Loading wallet data...</p>
            </div>
          </div>
        ) : showTransactionDemo ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="text-sm font-medium mb-2">Transaction Demo</h3>
              <div className="text-xs text-slate-500 mb-3">
                This demonstrates how USD transactions are processed using Autheo coins in the background
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-100 text-green-800 p-1.5 rounded-full">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">Autheo Coin Balance</div>
                  <div className="text-xl">{autheoInfo.balance} AUTHEO</div>
                  <div className="text-xs text-slate-500">Current rate: 1 USD = {autheoInfo.conversionRate} AUTHEO</div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="text-sm font-medium mb-1 block">Payment Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border rounded-md"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee (2%):</span>
                  <span>${(parseFloat(amount || '0') * 0.02).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Autheo coins required:</span>
                  <span>{Math.round(parseFloat(amount || '0') * autheoInfo.conversionRate)} AUTHEO</span>
                </div>
              </div>
              
              {autheoInfo.balance < Math.round(parseFloat(amount || '0') * autheoInfo.conversionRate) && (
                <div className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-700 text-xs flex items-center mb-3">
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                  <span>Insufficient Autheo coins for this transaction</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-1/2"
                  onClick={() => setShowTransactionDemo(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="w-1/2 bg-autheo-primary"
                  onClick={processTransaction}
                  disabled={processing || autheoInfo.balance < Math.round(parseFloat(amount || '0') * autheoInfo.conversionRate)}
                >
                  {processing ? 'Processing...' : 'Process Payment'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="contracts-list space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{contract.name}</h3>
                    {getStatusBadge(contract.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{contract.description}</p>
                  {contract.expiresAt && (
                    <div className="text-xs text-muted-foreground">
                      Expires: {new Date(contract.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                  {contract.status === 'pending' && (
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleActivate(contract.id)}
                      >
                        Activate Contract
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
              <div className="space-y-2">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map(tx => (
                    <div key={tx.id} className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">${tx.amount.toFixed(2)}</div>
                          <div className="text-xs text-slate-500">{tx.description}</div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Check className="h-3 w-3 mr-1" /> 
                          Processed
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex justify-between">
                        <span>Fee: ${tx.fee.toFixed(2)}</span>
                        <span>Autheo coins: {tx.autheoCoinsUsed}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-500 text-sm">
                    No transactions yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2" 
          onClick={() => showTransactionDemo ? setShowTransactionDemo(false) : setShowTransactionDemo(true)}
        >
          <DollarSign className="h-4 w-4" />
          {showTransactionDemo ? 'Hide Transaction Demo' : 'Demo Transaction Processing'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SmartContracts;
