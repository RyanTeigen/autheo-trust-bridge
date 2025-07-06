import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, CheckCircle, Settings, Webhook, Link2, AlertTriangle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AnchoringSetupGuide() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
      toast({
        title: "Copied",
        description: `${item} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const environmentVariables = [
    {
      name: 'BLOCKCHAIN_RPC_URL',
      description: 'RPC endpoint for blockchain network (e.g., Polygon, Ethereum)',
      example: 'https://rpc-mainnet.maticvigil.com/',
      required: false,
      note: 'Defaults to Polygon if not provided'
    },
    {
      name: 'WALLET_PRIVATE_KEY',
      description: 'Private key for blockchain transactions (keep secure!)',
      example: '0x1234567890abcdef...',
      required: false,
      note: 'Uses simulation mode if not provided'
    },
    {
      name: 'WEBHOOK_URL',
      description: 'Endpoint to receive anchoring notifications',
      example: 'https://your-app.com/webhooks/anchoring',
      required: false,
      note: 'Skip webhook notifications if not provided'
    }
  ];

  const testAnchoring = async () => {
    try {
      const response = await fetch('/functions/v1/anchor-hashes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      toast({
        title: "Anchoring Test",
        description: result.message || 'Anchoring process triggered',
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to trigger anchoring process",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-autheo-primary flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Blockchain Anchoring Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <Alert className="bg-blue-900/20 border-blue-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-blue-300">
            <strong>Current Status:</strong> The system is running in simulation mode. 
            Configure the environment variables below to enable real blockchain anchoring.
          </AlertDescription>
        </Alert>

        {/* Environment Variables */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Environment Variables
          </h3>
          
          {environmentVariables.map((envVar) => (
            <div key={envVar.name} className="bg-slate-700/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="bg-slate-600/50 px-2 py-1 rounded text-autheo-primary text-sm font-mono">
                    {envVar.name}
                  </code>
                  {!envVar.required && (
                    <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                      Optional
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(envVar.name, envVar.name)}
                  className="h-6 px-2 text-slate-400 hover:text-autheo-primary"
                >
                  {copiedItem === envVar.name ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              
              <p className="text-sm text-slate-300">{envVar.description}</p>
              
              <div className="space-y-2">
                <div className="text-xs text-slate-400">Example:</div>
                <div className="bg-slate-800/50 p-2 rounded font-mono text-xs text-slate-200 break-all">
                  {envVar.example}
                </div>
              </div>
              
              {envVar.note && (
                <div className="text-xs text-slate-400 italic">
                  💡 {envVar.note}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Setup Instructions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Setup Instructions
          </h3>
          
          <div className="bg-slate-700/20 rounded-lg p-4 space-y-3">
            <ol className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="bg-autheo-primary text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">1</span>
                <div>
                  <strong>Configure Environment Variables:</strong>
                  <p className="text-slate-400 mt-1">
                    Go to your Supabase project → Settings → Edge Functions → Environment Variables
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-autheo-primary text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">2</span>
                <div>
                  <strong>Add Variables:</strong>
                  <p className="text-slate-400 mt-1">
                    Add the environment variables above based on your blockchain and webhook requirements
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-autheo-primary text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">3</span>
                <div>
                  <strong>Test Anchoring:</strong>
                  <p className="text-slate-400 mt-1">
                    Use the test button below to verify the anchoring process works
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-autheo-primary text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">4</span>
                <div>
                  <strong>Monitor Activity:</strong>
                  <p className="text-slate-400 mt-1">
                    Check the Webhook Events section above to monitor anchoring activity
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-slate-700">
          <Button 
            onClick={testAnchoring}
            className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Test Anchoring Process
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.open('https://supabase.com/dashboard/project/_/settings/functions', '_blank')}
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Supabase Environment Variables
          </Button>
        </div>

        {/* Automation Info */}
        <Alert className="bg-green-900/20 border-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-300">
            <strong>Automated Processing:</strong> The system automatically processes pending hashes every 10 minutes using a cron job. 
            No manual intervention is required once configured.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}