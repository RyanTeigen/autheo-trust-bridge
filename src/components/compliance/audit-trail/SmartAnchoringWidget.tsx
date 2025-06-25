
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  Clock, 
  Database, 
  CheckCircle, 
  Loader2, 
  AlertTriangle,
  TrendingUp,
  Shield
} from 'lucide-react';
import { SmartAuditAnchoringService } from '@/services/audit/SmartAuditAnchoringService';
import { useToast } from '@/hooks/use-toast';

interface SmartAnchoringWidgetProps {
  useMainnet?: boolean;
  onAnchoringComplete?: () => void;
}

const SmartAnchoringWidget: React.FC<SmartAnchoringWidgetProps> = ({ 
  useMainnet = false,
  onAnchoringComplete 
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [checkResult, setCheckResult] = useState<any>(null);
  const { toast } = useToast();

  const smartAnchoringService = new SmartAuditAnchoringService(useMainnet);

  const fetchStatus = async () => {
    try {
      const statusData = await smartAnchoringService.getAnchoringStatus();
      setStatus(statusData);
    } catch (error) {
      console.error('Failed to fetch anchoring status:', error);
    }
  };

  const checkForNewLogs = async () => {
    setIsChecking(true);
    try {
      console.log('🔍 Checking for new audit logs...');
      
      const result = await smartAnchoringService.checkForNewLogs();
      setCheckResult(result);
      
      if (result.shouldAnchor) {
        toast({
          title: "New Logs Detected! 🆕",
          description: `Found ${result.newLogsCount} new audit logs ready for anchoring`,
        });
      } else {
        toast({
          title: "No New Logs",
          description: "All audit logs are already anchored on the blockchain",
        });
      }
      
      await fetchStatus();
    } catch (error) {
      console.error('❌ Check failed:', error);
      toast({
        title: "Check Failed",
        description: "Failed to check for new audit logs",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  const performSmartAnchoring = async () => {
    setIsAnchoring(true);
    try {
      console.log('⛓️ Starting smart anchoring...');
      
      const result = await smartAnchoringService.performSmartAnchoring({
        useMainnet,
        skipDatabaseStorage: false
      });
      
      if (result.anchorResult?.success) {
        toast({
          title: "Smart Anchoring Completed! 🎉",
          description: `Successfully anchored ${result.newLogsCount} new audit logs`,
        });
        
        if (onAnchoringComplete) {
          onAnchoringComplete();
        }
      } else if (!result.shouldAnchor) {
        toast({
          title: "No Anchoring Needed",
          description: "All audit logs are already up to date on the blockchain",
        });
      } else {
        throw new Error(result.anchorResult?.error || 'Anchoring failed');
      }
      
      await fetchStatus();
      setCheckResult(null); // Reset check result after successful anchoring
    } catch (error) {
      console.error('❌ Smart anchoring failed:', error);
      toast({
        title: "Smart Anchoring Failed",
        description: error instanceof Error ? error.message : "Failed to anchor audit logs",
        variant: "destructive"
      });
    } finally {
      setIsAnchoring(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [useMainnet]);

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Smart Audit Anchoring
          <Badge variant="outline" className="text-blue-400 border-blue-400 ml-2">
            {useMainnet ? 'MAINNET' : 'TESTNET'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Intelligent anchoring that only processes new audit logs, saving gas and blockchain resources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        {status && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Shield className="h-3 w-3" />
                Total Anchors
              </div>
              <div className="text-lg font-semibold text-slate-200">
                {status.totalAnchors}
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Database className="h-3 w-3" />
                Logs Anchored
              </div>
              <div className="text-lg font-semibold text-green-400">
                {status.totalLogsAnchored.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <TrendingUp className="h-3 w-3" />
                Pending Logs
              </div>
              <div className={`text-lg font-semibold ${status.pendingLogs > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                {status.pendingLogs}
              </div>
            </div>
            
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Clock className="h-3 w-3" />
                Last Anchored
              </div>
              <div className="text-xs text-slate-200">
                {status.lastAnchoredAt ? 
                  new Date(status.lastAnchoredAt).toLocaleDateString() : 
                  'Never'
                }
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={checkForNewLogs}
            disabled={isChecking}
            variant="outline"
            className="border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-slate-900"
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Check for New Logs
              </>
            )}
          </Button>

          {checkResult?.shouldAnchor && (
            <Button
              onClick={performSmartAnchoring}
              disabled={isAnchoring}
              className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
            >
              {isAnchoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Anchoring...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Smart Anchor ({checkResult.newLogsCount} logs)
                </>
              )}
            </Button>
          )}
        </div>

        {/* Check Result Display */}
        {checkResult && (
          <Alert className={`${checkResult.shouldAnchor ? 'bg-yellow-900/20 border-yellow-500/30' : 'bg-green-900/20 border-green-500/30'}`}>
            {checkResult.shouldAnchor ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  {checkResult.shouldAnchor ? 
                    `${checkResult.newLogsCount} New Logs Ready for Anchoring` : 
                    'All Logs Up to Date'
                  }
                </div>
                <div className="text-xs">
                  {checkResult.lastAnchoredAt ? 
                    `Last anchored: ${new Date(checkResult.lastAnchoredAt).toLocaleString()} (${checkResult.lastAnchoredLogCount} logs)` :
                    'No previous anchoring found'
                  }
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-slate-400 space-y-1">
          <p>• <strong>Smart Anchoring:</strong> Only processes new audit logs since the last anchoring</p>
          <p>• <strong>Gas Efficient:</strong> Reduces blockchain transaction costs by avoiding duplicate work</p>
          <p>• <strong>Automatic Detection:</strong> Intelligently determines when anchoring is needed</p>
          <p>• <strong>Batch Processing:</strong> Anchors all new logs in a single blockchain transaction</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartAnchoringWidget;
