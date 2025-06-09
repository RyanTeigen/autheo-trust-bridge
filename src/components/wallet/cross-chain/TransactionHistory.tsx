
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  RefreshCw,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { CrossChainTransaction, BlockchainNetwork } from '@/services/blockchain/CrossChainService';

interface TransactionHistoryProps {
  transactions: CrossChainTransaction[];
  supportedNetworks: BlockchainNetwork[];
  onRefresh: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  supportedNetworks,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getNetworkByName = (networkId: string) => {
    return supportedNetworks.find(n => n.id === networkId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-600/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-amber-600/20 text-amber-400 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'bridging':
        return (
          <Badge variant="outline" className="bg-blue-600/20 text-blue-400 border-blue-500/30">
            <Clock className="h-3 w-3 mr-1 animate-pulse" />
            Bridging
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-600/20 text-red-400 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-600/20 text-slate-400 border-slate-500/30">
            Unknown
          </Badge>
        );
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = searchQuery === '' || 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toAddress.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openExplorer = (networkId: string, txHash: string) => {
    const network = getNetworkByName(networkId);
    if (network && txHash) {
      window.open(`${network.explorerUrl}/tx/${txHash}`, '_blank');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-autheo-primary">Transaction History</CardTitle>
              <CardDescription className="text-slate-300">
                Track your cross-chain bridge transactions
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="border-slate-600 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by transaction ID or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-slate-100"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="bridging">Bridging</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-slate-400">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      {filteredTransactions.length === 0 ? (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-300 mb-2">No Transactions Found</h3>
            <p className="text-slate-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'No transactions match your search criteria' 
                : 'You haven\'t made any cross-chain transactions yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map(transaction => {
            const fromNetwork = getNetworkByName(transaction.fromNetwork);
            const toNetwork = getNetworkByName(transaction.toNetwork);
            
            return (
              <Card key={transaction.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-100">
                          {fromNetwork?.name}
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-100">
                          {toNetwork?.name}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Amount</p>
                      <p className="text-slate-100 font-medium">
                        {transaction.amount} {fromNetwork?.nativeCurrency.symbol}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-slate-400">THEO Used</p>
                      <p className="text-autheo-primary font-medium">
                        {transaction.theoAmount} THEO
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-slate-400">From Address</p>
                      <p className="text-slate-100 font-mono">
                        {formatAddress(transaction.fromAddress)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-slate-400">To Address</p>
                      <p className="text-slate-100 font-mono">
                        {formatAddress(transaction.toAddress)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400">
                        {formatTimestamp(transaction.timestamp)}
                        {transaction.estimatedTime && transaction.status !== 'completed' && (
                          <span className="ml-2">
                            • Est. {transaction.estimatedTime} min
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {transaction.txHash && fromNetwork && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openExplorer(transaction.fromNetwork, transaction.txHash!)}
                            className="border-slate-600 hover:bg-slate-700 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            From Tx
                          </Button>
                        )}
                        
                        {transaction.bridgeTxHash && toNetwork && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openExplorer(transaction.toNetwork, transaction.bridgeTxHash!)}
                            className="border-slate-600 hover:bg-slate-700 text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            To Tx
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
