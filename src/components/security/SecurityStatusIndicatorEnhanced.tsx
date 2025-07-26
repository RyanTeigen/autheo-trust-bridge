/**
 * Enhanced Security Status Indicator with Diagnostics
 * Shows security status with option to view detailed diagnostics
 */

import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Clock, RefreshCw, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useSecurityInitialization } from '@/hooks/useSecurityInitialization';
import { SecurityDiagnosticsPanel } from './SecurityDiagnosticsPanel';

interface SecurityStatusIndicatorEnhancedProps {
  showDetails?: boolean;
  compact?: boolean;
}

export const SecurityStatusIndicatorEnhanced: React.FC<SecurityStatusIndicatorEnhancedProps> = ({
  showDetails = false,
  compact = false
}) => {
  const { securityStatus, refreshSecurity, isSecure, isInitializing } = useSecurityInitialization();
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);

  const getStatusIcon = () => {
    if (isInitializing) {
      return <Clock className="w-4 h-4 animate-pulse" />;
    }
    
    switch (securityStatus.overallStatus) {
      case 'secure':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusColor = () => {
    switch (securityStatus.overallStatus) {
      case 'secure':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = () => {
    if (isInitializing) return 'Initializing Security...';
    
    switch (securityStatus.overallStatus) {
      case 'secure':
        return 'Security Active';
      case 'degraded':
        return 'Security Degraded';
      case 'critical':
        return 'Security Critical';
      default:
        return 'Security Unknown';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
          {getStatusIcon()}
          {securityStatus.overallStatus.toUpperCase()}
        </Badge>
        <Dialog open={diagnosticsOpen} onOpenChange={setDiagnosticsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Settings className="w-3 h-3" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <SecurityDiagnosticsPanel onClose={() => setDiagnosticsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={diagnosticsOpen} onOpenChange={setDiagnosticsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Diagnostics
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
              <SecurityDiagnosticsPanel onClose={() => setDiagnosticsOpen(false)} />
            </DialogContent>
          </Dialog>
          {!isSecure && !isInitializing && (
            <Button variant="outline" size="sm" onClick={refreshSecurity}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Security
            </Button>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Security Headers:</span>
              <Badge variant={securityStatus.headersInitialized ? 'default' : 'destructive'}>
                {securityStatus.headersInitialized ? 'Active' : 'Failed'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>CSRF Protection:</span>
              <Badge variant={securityStatus.csrfProtected ? 'default' : 'destructive'}>
                {securityStatus.csrfProtected ? 'Active' : 'Failed'}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Encryption Keys:</span>
              <Badge variant={securityStatus.keysSecure ? 'default' : 'destructive'}>
                {securityStatus.keysSecure ? 'Secure' : 'Degraded'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Security Hardening:</span>
              <Badge variant={securityStatus.hardeningActive ? 'default' : 'destructive'}>
                {securityStatus.hardeningActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {securityStatus.lastError && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          <strong>Error:</strong> {securityStatus.lastError}
        </div>
      )}
    </div>
  );
};