
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Database } from 'lucide-react';
import ZeroKnowledgeVerification from '../ZeroKnowledgeVerification';
import BlockchainAnchoringStatus from '../BlockchainAnchoringStatus';
import AtomicDataViewer from '@/components/medical/AtomicDataViewer';
import WebhookEventsViewer from '../WebhookEventsViewer';
import AnchoringSetupGuide from '../AnchoringSetupGuide';
import BlockchainVerificationTab from '../BlockchainVerificationTab';

const ComplianceToolsTab: React.FC = () => {
  const [recordId, setRecordId] = useState('');
  const [showAtomicData, setShowAtomicData] = useState(false);

  const handleSearchAtomic = () => {
    if (recordId.trim()) {
      setShowAtomicData(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Anchoring Setup Guide */}
      <AnchoringSetupGuide />
      
      {/* Blockchain Verification Records */}
      <BlockchainVerificationTab />
      
      {/* Blockchain Anchoring Status */}
      <BlockchainAnchoringStatus />
      
      {/* Zero-Knowledge Verification */}
      <ZeroKnowledgeVerification />

      {/* Webhook Events Monitoring */}
      <WebhookEventsViewer />

      {/* Atomic Data Points Analysis */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-autheo-primary" />
            <div>
              <CardTitle className="text-slate-200">Atomic Data Points Analysis</CardTitle>
              <CardDescription>
                View encrypted atomic data points for homomorphic encryption operations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="record-id" className="text-slate-300 mb-2 block">
                Medical Record ID
              </Label>
              <Input
                id="record-id"
                placeholder="Enter record ID to view atomic data..."
                value={recordId}
                onChange={(e) => setRecordId(e.target.value)}
                className="bg-slate-700 border-slate-600 text-slate-200"
                onKeyPress={(e) => e.key === 'Enter' && handleSearchAtomic()}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleSearchAtomic}
                disabled={!recordId.trim()}
                className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
              >
                <Search className="h-4 w-4 mr-2" />
                View Atomic Data
              </Button>
            </div>
          </div>

          {showAtomicData && recordId && (
            <AtomicDataViewer 
              recordId={recordId} 
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceToolsTab;
