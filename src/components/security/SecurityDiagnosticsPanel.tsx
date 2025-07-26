/**
 * Security Diagnostics Panel
 * Provides detailed view of security status and troubleshooting information
 */

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSecurityInitialization, SecurityDiagnostic } from '@/hooks/useSecurityInitialization';
import { formatDistanceToNow } from 'date-fns';

interface SecurityDiagnosticsPanelProps {
  onClose?: () => void;
}

export const SecurityDiagnosticsPanel: React.FC<SecurityDiagnosticsPanelProps> = ({ onClose }) => {
  const { securityStatus, refreshSecurity } = useSecurityInitialization();
  const [showDetails, setShowDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSecurity();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default' as const,
      warning: 'secondary' as const,
      error: 'destructive' as const
    };
    return variants[status as keyof typeof variants] || 'outline';
  };

  const groupedDiagnostics = securityStatus.diagnostics.reduce((acc, diagnostic) => {
    const component = diagnostic.component;
    if (!acc[component]) {
      acc[component] = [];
    }
    acc[component].push(diagnostic);
    return acc;
  }, {} as Record<string, SecurityDiagnostic[]>);

  const getComponentStatus = (diagnostics: SecurityDiagnostic[]) => {
    const latest = diagnostics[diagnostics.length - 1];
    return latest?.status || 'unknown';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Security Diagnostics</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Overall Status: <Badge variant={getStatusBadge(securityStatus.overallStatus)}>
            {securityStatus.overallStatus.toUpperCase()}
          </Badge>
          {securityStatus.retryCount > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              (Retry attempt: {securityStatus.retryCount})
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Security Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Security Headers</span>
              <Badge variant={securityStatus.headersInitialized ? 'default' : 'destructive'}>
                {securityStatus.headersInitialized ? 'Active' : 'Failed'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">CSRF Protection</span>
              <Badge variant={securityStatus.csrfProtected ? 'default' : 'destructive'}>
                {securityStatus.csrfProtected ? 'Active' : 'Failed'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Encryption Keys</span>
              <Badge variant={securityStatus.keysSecure ? 'default' : 'destructive'}>
                {securityStatus.keysSecure ? 'Secure' : 'Degraded'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Hardware Security</span>
              <Badge variant={securityStatus.webAuthnSupported ? 'default' : 'secondary'}>
                {securityStatus.webAuthnSupported ? 'Available' : 'Fallback'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Last Error */}
        {securityStatus.lastError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Last Error:</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{securityStatus.lastError}</p>
          </div>
        )}

        {/* Component Diagnostics */}
        {Object.keys(groupedDiagnostics).length > 0 && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                Component Details ({Object.keys(groupedDiagnostics).length} components)
                <span className="text-xs">
                  {showDetails ? 'Click to collapse' : 'Click to expand'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ScrollArea className="h-64 mt-2">
                <div className="space-y-3">
                  {Object.entries(groupedDiagnostics).map(([component, diagnostics]) => (
                    <div key={component} className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">{component}</span>
                        <Badge variant={getStatusBadge(getComponentStatus(diagnostics))}>
                          {getComponentStatus(diagnostics)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {diagnostics.slice(-3).map((diagnostic, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            {getStatusIcon(diagnostic.status)}
                            <div className="flex-1">
                              <p className="text-sm">{diagnostic.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(diagnostic.timestamp, { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Troubleshooting Tips */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Troubleshooting Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• If keys are degraded, try refreshing the page to retry initialization</li>
            <li>• Hardware security warnings are normal on devices without WebAuthn support</li>
            <li>• CSRF protection failures may indicate network connectivity issues</li>
            <li>• Contact support if issues persist after multiple refresh attempts</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};