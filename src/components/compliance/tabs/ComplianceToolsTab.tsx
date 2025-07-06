
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Database, 
  Shield, 
  Settings, 
  Webhook, 
  Link2, 
  Eye,
  Lock,
  Activity,
  FileCheck,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import ZeroKnowledgeVerification from '../ZeroKnowledgeVerification';
import BlockchainAnchoringStatus from '../BlockchainAnchoringStatus';
import AtomicDataViewer from '@/components/medical/AtomicDataViewer';
import WebhookEventsViewer from '../WebhookEventsViewer';
import AnchoringSetupGuide from '../AnchoringSetupGuide';
import BlockchainVerificationTab from '../BlockchainVerificationTab';

const ComplianceToolsTab: React.FC = () => {
  const [recordId, setRecordId] = useState('');
  const [showAtomicData, setShowAtomicData] = useState(false);
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

  const handleSearchAtomic = () => {
    if (recordId.trim()) {
      setShowAtomicData(true);
    }
  };

  const quickActions = [
    {
      id: 'verify-record',
      title: 'Verify Record',
      description: 'Quick verification of medical record integrity',
      icon: Shield,
      color: 'bg-blue-500',
      action: () => setActiveQuickAction('verify-record')
    },
    {
      id: 'audit-trail',
      title: 'Audit Trail',
      description: 'View blockchain anchoring status',
      icon: FileCheck,
      color: 'bg-green-500',
      action: () => setActiveQuickAction('audit-trail')
    },
    {
      id: 'webhook-monitor',
      title: 'Monitor Events',
      description: 'Real-time webhook monitoring',
      icon: Activity,
      color: 'bg-purple-500',
      action: () => setActiveQuickAction('webhook-monitor')
    },
    {
      id: 'system-setup',
      title: 'System Setup',
      description: 'Configure blockchain anchoring',
      icon: Settings,
      color: 'bg-orange-500',
      action: () => setActiveQuickAction('system-setup')
    }
  ];

  const complianceStats = [
    { label: 'Records Anchored', value: '1,247', status: 'success', icon: CheckCircle },
    { label: 'Pending Verification', value: '23', status: 'warning', icon: AlertTriangle },
    { label: 'Failed Anchors', value: '2', status: 'error', icon: AlertTriangle },
    { label: 'Active Webhooks', value: '12', status: 'info', icon: Webhook }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Compliance Tools</h2>
          <p className="text-muted-foreground">
            Comprehensive tools for healthcare compliance monitoring and verification
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {complianceStats.map((stat, index) => (
            <Card key={index} className="hover-scale animate-fade-in">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-full ${
                    stat.status === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                    stat.status === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' :
                    stat.status === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' :
                    'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  }`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common compliance tasks and verification tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-3 hover-scale"
                onClick={action.action}
              >
                <div className={`p-3 rounded-full ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tools Interface */}
      <Tabs defaultValue="verification" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="verification" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Verification
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blockchain Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Blockchain Records
                </CardTitle>
                <CardDescription>
                  View anchored medical records on Autheo blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainVerificationTab />
              </CardContent>
            </Card>

            {/* Zero-Knowledge Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Zero-Knowledge Proofs
                </CardTitle>
                <CardDescription>
                  Cryptographic verification without data exposure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ZeroKnowledgeVerification />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Anchoring Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  Anchoring Status
                </CardTitle>
                <CardDescription>
                  Real-time blockchain anchoring monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BlockchainAnchoringStatus />
              </CardContent>
            </Card>

            {/* Webhook Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5 text-primary" />
                  Event Monitoring
                </CardTitle>
                <CardDescription>
                  Webhook events and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WebhookEventsViewer />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Atomic Data Analysis */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Atomic Data Analysis</CardTitle>
                  <CardDescription>
                    View encrypted atomic data points for homomorphic operations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="record-id" className="text-sm font-medium mb-2 block">
                    Medical Record ID
                  </Label>
                  <Input
                    id="record-id"
                    placeholder="Enter record ID to analyze atomic data..."
                    value={recordId}
                    onChange={(e) => setRecordId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchAtomic()}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleSearchAtomic}
                    disabled={!recordId.trim()}
                    className="gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Analyze
                  </Button>
                </div>
              </div>

              {showAtomicData && recordId && (
                <div className="animate-fade-in">
                  <AtomicDataViewer recordId={recordId} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          {/* System Setup */}
          <AnchoringSetupGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceToolsTab;
