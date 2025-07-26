/**
 * Security Status Indicator Component
 * Shows current security posture to users
 */

import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSecurityInitialization } from '@/hooks/useSecurityInitialization';

interface SecurityStatusIndicatorProps {
  showDetails?: boolean;
  compact?: boolean;
}

export const SecurityStatusIndicator: React.FC<SecurityStatusIndicatorProps> = ({
  showDetails = false,
  compact = false
}) => {
  const { securityStatus, refreshSecurity, isSecure, isInitializing } = useSecurityInitialization();

  const getStatusIcon = () => {
    if (isInitializing) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    switch (securityStatus.overallStatus) {
      case 'secure':
        return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
      case 'degraded':
        return <ShieldAlert className="h-4 w-4 text-amber-500" />;
      case 'critical':
        return <ShieldAlert className="h-4 w-4 text-destructive" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (securityStatus.overallStatus) {
      case 'secure':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'degraded':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
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
      <Badge variant="outline" className={getStatusColor()}>
        {getStatusIcon()}
        {!isInitializing && (
          <span className="ml-1">{securityStatus.overallStatus}</span>
        )}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-2 py-1 rounded-md border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {showDetails && (
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${securityStatus.headersInitialized ? 'bg-emerald-500' : 'bg-destructive'}`} />
            <span>Security Headers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${securityStatus.csrfProtected ? 'bg-emerald-500' : 'bg-destructive'}`} />
            <span>CSRF Protection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${securityStatus.keysSecure ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>Secure Keys</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${securityStatus.hardeningActive ? 'bg-emerald-500' : 'bg-destructive'}`} />
            <span>Security Hardening</span>
          </div>
        </div>
      )}
      
      {!isSecure && !isInitializing && (
        <Button
          size="sm"
          variant="outline"
          onClick={refreshSecurity}
          className="ml-2"
        >
          Refresh Security
        </Button>
      )}
    </div>
  );
};