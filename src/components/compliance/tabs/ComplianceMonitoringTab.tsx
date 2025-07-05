
import React from 'react';
import RealTimeComplianceMonitor from '@/components/compliance/RealTimeComplianceMonitor';
import QuantumSecurityDashboard from '@/components/security/QuantumSecurityDashboard';
import ComplianceQuantumScoreCard from '@/components/compliance/ComplianceQuantumScoreCard';
import { useEncryptedAnalytics } from '@/hooks/useEncryptedAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, TrendingUp, Database } from 'lucide-react';

const ComplianceMonitoringTab: React.FC = () => {
  const { data: encryptedMetrics, loading, error, refetch } = useEncryptedAnalytics();

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Real-Time Monitoring</h2>
        <p className="text-muted-foreground">
          Live monitoring of security events, access patterns, and compliance metrics
        </p>
      </div>
      
      {/* Quantum Security Score */}
      <ComplianceQuantumScoreCard />
      
      {/* Encrypted Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Encrypted Medical Record Analytics</h3>
            <p className="text-sm text-muted-foreground">
              Zero-knowledge aggregations of patient data with end-to-end encryption
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
            className="bg-card border-border hover:bg-muted"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert className="bg-destructive/10 border-destructive/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-destructive-foreground">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading encrypted metrics...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {encryptedMetrics.map((metric) => (
              <Card key={metric.record_type} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize text-card-foreground">
                      {metric.record_type.replace(/_/g, " ")}
                    </CardTitle>
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Encrypted Average:</p>
                      <p className="font-mono text-xs bg-muted/50 p-1 rounded text-primary">
                        {metric.encrypted_avg}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Encrypted Sum:</p>
                      <p className="font-mono text-xs bg-muted/50 p-1 rounded text-secondary">
                        {metric.encrypted_sum}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Min Value:</p>
                      <p className="font-mono text-xs bg-muted/50 p-1 rounded text-accent">
                        {metric.encrypted_min}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Max Value:</p>
                      <p className="font-mono text-xs bg-muted/50 p-1 rounded text-accent">
                        {metric.encrypted_max}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-card-foreground">
                        {metric.count} Records
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && encryptedMetrics.length === 0 && !error && (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-card-foreground mb-2">No Analytics Data</h3>
              <p className="text-muted-foreground">
                No encrypted medical record analytics are available yet. Data will appear as records are processed.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <RealTimeComplianceMonitor />
      <QuantumSecurityDashboard />
    </div>
  );
};

export default ComplianceMonitoringTab;
