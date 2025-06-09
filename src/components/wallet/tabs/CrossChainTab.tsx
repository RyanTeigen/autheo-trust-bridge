
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowRightLeft, 
  Network, 
  Coins, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Zap,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import CrossChainService, { BlockchainNetwork, CrossChainTransaction, BridgeQuote } from '@/services/blockchain/CrossChainService';
import CrossChainBridge from '../cross-chain/CrossChainBridge';
import NetworkSelector from '../cross-chain/NetworkSelector';
import TransactionHistory from '../cross-chain/TransactionHistory';

const CrossChainTab: React.FC = () => {
  const { toast } = useToast();
  const { wallet } = useWallet();
  const [crossChainService] = useState(() => CrossChainService.getInstance());
  const [supportedNetworks, setSupportedNetworks] = useState<BlockchainNetwork[]>([]);
  const [currentNetwork, setCurrentNetwork] = useState<BlockchainNetwork | null>(null);
  const [transactions, setTransactions] = useState<CrossChainTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bridge');

  useEffect(() => {
    loadNetworks();
    if (wallet?.address) {
      loadTransactionHistory();
    }
  }, [wallet]);

  const loadNetworks = async () => {
    try {
      const networks = await crossChainService.getSupportedNetworks();
      setSupportedNetworks(networks);
      
      // Set current network based on wallet chain ID
      if (wallet?.chainId) {
        const current = networks.find(n => n.chainId === wallet.chainId);
        setCurrentNetwork(current || networks[0]);
      } else {
        setCurrentNetwork(networks[0]);
      }
    } catch (error) {
      console.error('Error loading networks:', error);
      toast({
        title: "Error Loading Networks",
        description: "Could not load supported blockchain networks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactionHistory = async () => {
    if (!wallet?.address) return;
    
    try {
      const history = await crossChainService.getTransactionHistory(wallet.address);
      setTransactions(history);
    } catch (error) {
      console.error('Error loading transaction history:', error);
    }
  };

  const handleNetworkSwitch = async (network: BlockchainNetwork) => {
    try {
      const success = await crossChainService.switchNetwork(network.id);
      if (success) {
        setCurrentNetwork(network);
        toast({
          title: "Network Switched",
          description: `Successfully switched to ${network.name}`,
        });
      }
    } catch (error) {
      toast({
        title: "Network Switch Failed",
        description: `Could not switch to ${network.name}`,
        variant: "destructive"
      });
    }
  };

  const handleBridgeComplete = (transaction: CrossChainTransaction) => {
    setTransactions(prev => [transaction, ...prev]);
    toast({
      title: "Bridge Initiated",
      description: `Cross-chain transfer initiated. Estimated time: ${transaction.estimatedTime} minutes`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  const getNetworkStats = () => {
    const totalNetworks = supportedNetworks.length;
    const mainnetNetwork = supportedNetworks.find(n => n.isMainnet);
    const pendingTxs = transactions.filter(tx => tx.status === 'pending' || tx.status === 'bridging').length;
    
    return { totalNetworks, mainnetNetwork, pendingTxs };
  };

  const { totalNetworks, mainnetNetwork, pendingTxs } = getNetworkStats();

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Network className="h-6 w-6" />
            Cross-Chain Interoperability
          </CardTitle>
          <CardDescription className="text-slate-300">
            Bridge assets across multiple blockchain networks through THEO tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Supported Networks</p>
                  <p className="text-2xl font-bold text-slate-100">{totalNetworks}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Current Network</p>
                  <p className="text-lg font-semibold text-autheo-primary">
                    {currentNetwork?.name || 'Not Connected'}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-autheo-primary" />
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pending Bridges</p>
                  <p className="text-2xl font-bold text-amber-400">{pendingTxs}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
            </div>
          </div>

          {mainnetNetwork && (
            <Alert className="mt-4 bg-autheo-primary/10 border-autheo-primary/30">
              <Coins className="h-4 w-4" />
              <AlertDescription className="text-slate-100">
                All cross-chain transactions are processed through <strong>{mainnetNetwork.name}</strong> using THEO tokens as the bridge currency.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800 border-slate-700 mb-6">
          <TabsTrigger 
            value="bridge" 
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
          >
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Bridge Assets
          </TabsTrigger>
          <TabsTrigger 
            value="networks" 
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
          >
            <Network className="h-4 w-4 mr-2" />
            Networks
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
          >
            <Clock className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bridge">
          <CrossChainBridge
            supportedNetworks={supportedNetworks}
            currentNetwork={currentNetwork}
            onBridgeComplete={handleBridgeComplete}
          />
        </TabsContent>

        <TabsContent value="networks">
          <NetworkSelector
            networks={supportedNetworks}
            currentNetwork={currentNetwork}
            onNetworkSelect={handleNetworkSwitch}
          />
        </TabsContent>

        <TabsContent value="history">
          <TransactionHistory
            transactions={transactions}
            supportedNetworks={supportedNetworks}
            onRefresh={loadTransactionHistory}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrossChainTab;
