
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Network, 
  ExternalLink, 
  Zap, 
  Shield, 
  Clock,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { BlockchainNetwork } from '@/services/blockchain/CrossChainService';

interface NetworkSelectorProps {
  networks: BlockchainNetwork[];
  currentNetwork: BlockchainNetwork | null;
  onNetworkSelect: (network: BlockchainNetwork) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  networks,
  currentNetwork,
  onNetworkSelect
}) => {
  const mainnetNetworks = networks.filter(n => n.isMainnet);
  const testnetNetworks = networks.filter(n => !n.isMainnet);

  const NetworkCard: React.FC<{ network: BlockchainNetwork; isCurrent: boolean }> = ({ 
    network, 
    isCurrent 
  }) => (
    <Card className={`bg-slate-800 border-slate-700 transition-all duration-200 hover:border-autheo-primary/50 ${
      isCurrent ? 'ring-2 ring-autheo-primary/50 bg-autheo-primary/5' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              isCurrent ? 'bg-autheo-primary' : 'bg-slate-500'
            }`} />
            <div>
              <CardTitle className="text-lg text-slate-100">{network.name}</CardTitle>
              <CardDescription className="text-slate-400">
                Chain ID: {network.chainId}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            {network.isMainnet && (
              <Badge variant="outline" className="bg-autheo-primary/20 text-autheo-primary border-autheo-primary/30">
                <Zap className="h-3 w-3 mr-1" />
                Mainnet
              </Badge>
            )}
            {isCurrent && (
              <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Native Currency</p>
            <p className="text-slate-100 font-medium">{network.nativeCurrency.symbol}</p>
          </div>
          <div>
            <p className="text-slate-400">Block Time</p>
            <p className="text-slate-100 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {network.blockTime}s
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-slate-400 text-sm">THEO Token Address</p>
          <p className="text-xs font-mono bg-slate-700 p-2 rounded text-slate-300 break-all">
            {network.theoTokenAddress}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-slate-600 hover:bg-slate-700"
            onClick={() => window.open(network.explorerUrl, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Explorer
          </Button>
          
          {!isCurrent && (
            <Button
              size="sm"
              className="flex-1 bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
              onClick={() => onNetworkSelect(network)}
            >
              <Network className="h-3 w-3 mr-1" />
              Switch
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Mainnet Networks */}
      {mainnetNetworks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-autheo-primary" />
            <h3 className="text-lg font-semibold text-slate-100">Mainnet Networks</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainnetNetworks.map(network => (
              <NetworkCard
                key={network.id}
                network={network}
                isCurrent={currentNetwork?.id === network.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Testnet/Other Networks */}
      {testnetNetworks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-100">Partner Networks</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testnetNetworks.map(network => (
              <NetworkCard
                key={network.id}
                network={network}
                isCurrent={currentNetwork?.id === network.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Network Info */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-autheo-primary flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Compatibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-autheo-primary rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-slate-100 font-medium">THEO Token Standard</p>
              <p className="text-slate-400">
                All networks use standardized THEO token contracts for seamless interoperability
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-slate-100 font-medium">Smart Contract Security</p>
              <p className="text-slate-400">
                Cross-chain bridges are secured by audited smart contracts with multi-signature validation
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="text-slate-100 font-medium">Decentralized Validation</p>
              <p className="text-slate-400">
                All cross-chain transactions are validated by decentralized networks of validators
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkSelector;
