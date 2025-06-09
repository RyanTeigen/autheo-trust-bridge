
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRightLeft, 
  ArrowDown, 
  Loader2, 
  AlertTriangle, 
  Info,
  Coins,
  Clock,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/use-wallet';
import CrossChainService, { BlockchainNetwork, CrossChainTransaction, BridgeQuote } from '@/services/blockchain/CrossChainService';

interface CrossChainBridgeProps {
  supportedNetworks: BlockchainNetwork[];
  currentNetwork: BlockchainNetwork | null;
  onBridgeComplete: (transaction: CrossChainTransaction) => void;
}

const CrossChainBridge: React.FC<CrossChainBridgeProps> = ({
  supportedNetworks,
  currentNetwork,
  onBridgeComplete
}) => {
  const { toast } = useToast();
  const { wallet, signMessage } = useWallet();
  const [crossChainService] = useState(() => CrossChainService.getInstance());
  
  const [fromNetwork, setFromNetwork] = useState<BlockchainNetwork | null>(null);
  const [toNetwork, setToNetwork] = useState<BlockchainNetwork | null>(null);
  const [amount, setAmount] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    if (currentNetwork) {
      setFromNetwork(currentNetwork);
      // Auto-select a different network as destination
      const otherNetwork = supportedNetworks.find(n => n.id !== currentNetwork.id);
      if (otherNetwork) {
        setToNetwork(otherNetwork);
      }
    }
  }, [currentNetwork, supportedNetworks]);

  useEffect(() => {
    if (fromNetwork && toNetwork && amount && parseFloat(amount) > 0) {
      getQuote();
    } else {
      setQuote(null);
    }
  }, [fromNetwork, toNetwork, amount]);

  const getQuote = async () => {
    if (!fromNetwork || !toNetwork || !amount) return;
    
    setQuoteLoading(true);
    try {
      const bridgeQuote = await crossChainService.getBridgeQuote(
        fromNetwork.id,
        toNetwork.id,
        amount
      );
      setQuote(bridgeQuote);
    } catch (error) {
      console.error('Error getting quote:', error);
      toast({
        title: "Quote Error",
        description: "Could not get bridge quote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleBridge = async () => {
    if (!fromNetwork || !toNetwork || !amount || !toAddress || !wallet || !quote) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Sign a message to authorize the bridge
      const message = `Bridge ${amount} from ${fromNetwork.name} to ${toNetwork.name} at ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      if (!signature) {
        throw new Error('Transaction signature required');
      }

      const transaction = await crossChainService.initiateBridge(
        fromNetwork.id,
        toNetwork.id,
        amount,
        wallet.address,
        toAddress,
        signature
      );

      onBridgeComplete(transaction);
      
      // Reset form
      setAmount('');
      setToAddress('');
      setQuote(null);
      
    } catch (error) {
      console.error('Error initiating bridge:', error);
      toast({
        title: "Bridge Failed",
        description: "Could not initiate cross-chain bridge. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const swapNetworks = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
  };

  const isMainnetInvolved = fromNetwork?.isMainnet || toNetwork?.isMainnet;

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-100">
      <CardHeader>
        <CardTitle className="text-autheo-primary">Cross-Chain Asset Bridge</CardTitle>
        <CardDescription className="text-slate-300">
          Transfer assets between different blockchain networks using THEO tokens
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Network Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="flex-1">
              <Label className="text-slate-300">From Network</Label>
              <select
                className="w-full mt-1 p-3 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                value={fromNetwork?.id || ''}
                onChange={(e) => {
                  const network = supportedNetworks.find(n => n.id === e.target.value);
                  setFromNetwork(network || null);
                }}
              >
                <option value="">Select network</option>
                {supportedNetworks.map(network => (
                  <option key={network.id} value={network.id}>
                    {network.name} {network.isMainnet && '(Mainnet)'}
                  </option>
                ))}
              </select>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="mx-4 mt-6 border-slate-600 hover:bg-slate-700"
              onClick={swapNetworks}
              disabled={!fromNetwork || !toNetwork}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1">
              <Label className="text-slate-300">To Network</Label>
              <select
                className="w-full mt-1 p-3 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                value={toNetwork?.id || ''}
                onChange={(e) => {
                  const network = supportedNetworks.find(n => n.id === e.target.value);
                  setToNetwork(network || null);
                }}
              >
                <option value="">Select network</option>
                {supportedNetworks
                  .filter(n => n.id !== fromNetwork?.id)
                  .map(network => (
                    <option key={network.id} value={network.id}>
                      {network.name} {network.isMainnet && '(Mainnet)'}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {fromNetwork && toNetwork && (
            <div className="flex items-center justify-center py-2">
              <Badge variant="outline" className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30">
                {quote?.route.length === 2 ? 'Direct Bridge' : `Route: ${quote?.route.join(' → ')}`}
              </Badge>
            </div>
          )}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label className="text-slate-300">Amount to Bridge</Label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700 border-slate-600 text-slate-100 pr-20"
            />
            <div className="absolute right-3 top-3 text-sm text-slate-400">
              {fromNetwork?.nativeCurrency.symbol}
            </div>
          </div>
        </div>

        {/* Destination Address */}
        <div className="space-y-2">
          <Label className="text-slate-300">Destination Address</Label>
          <Input
            placeholder="0x..."
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="bg-slate-700 border-slate-600 text-slate-100"
          />
        </div>

        {/* Quote Display */}
        {quoteLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-slate-400">Getting quote...</span>
          </div>
        )}

        {quote && (
          <Card className="bg-slate-700/50 border-slate-600">
            <CardContent className="p-4">
              <h4 className="font-semibold text-slate-100 mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Bridge Quote
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">You send:</span>
                  <span className="text-slate-100">{quote.fromAmount} {fromNetwork?.nativeCurrency.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">You receive:</span>
                  <span className="text-slate-100">{quote.toAmount} {toNetwork?.nativeCurrency.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">THEO required:</span>
                  <span className="text-autheo-primary font-medium">{quote.theoRequired} THEO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bridge fee:</span>
                  <span className="text-slate-100">{quote.bridgeFee} {fromNetwork?.nativeCurrency.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network fee:</span>
                  <span className="text-slate-100">{quote.networkFee} {fromNetwork?.nativeCurrency.symbol}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-600">
                  <span className="text-slate-400">Estimated time:</span>
                  <span className="text-slate-100 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {quote.estimatedTime} minutes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warnings and Info */}
        {!isMainnetInvolved && (
          <Alert className="bg-amber-900/20 border-amber-500/30">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-amber-200">
              This cross-chain bridge will route through the Autheo mainnet and require THEO tokens as collateral.
            </AlertDescription>
          </Alert>
        )}

        <Alert className="bg-blue-900/20 border-blue-500/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-blue-200">
            All cross-chain transactions are secured by smart contracts and require THEO tokens to ensure network security and decentralization.
          </AlertDescription>
        </Alert>

        {/* Bridge Button */}
        <Button
          onClick={handleBridge}
          disabled={loading || !quote || !wallet || !toAddress}
          className="w-full bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900 font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Initiating Bridge...
            </>
          ) : (
            <>
              <ArrowRightLeft className="h-4 w-4 mr-2" />
              Bridge Assets
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CrossChainBridge;
