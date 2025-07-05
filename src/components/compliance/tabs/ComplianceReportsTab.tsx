
import React, { useState } from 'react';
import ComplianceTrendChart from '@/components/compliance/ComplianceTrendChart';
import ComplianceRadarChart from '@/components/compliance/ComplianceRadarChart';
import ComplianceRecommendations from '@/components/compliance/ComplianceRecommendations';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import ComplianceExportButton from '@/components/compliance/ComplianceExportButton';
import ExportAuditLogsButton from '@/components/compliance/ExportAuditLogsButton';

const ComplianceReportsTab: React.FC = () => {
  // Sample trend data for the compliance trend chart
  const trendData = [
    { date: 'Jan', overall: 84, privacyRule: 90, securityRule: 80, breachNotification: 95, administrative: 75, physical: 70 },
    { date: 'Feb', overall: 86, privacyRule: 92, securityRule: 82, breachNotification: 95, administrative: 78, physical: 74 },
    { date: 'Mar', overall: 88, privacyRule: 94, securityRule: 86, breachNotification: 98, administrative: 80, physical: 75 },
    { date: 'Apr', overall: 90, privacyRule: 96, securityRule: 90, breachNotification: 100, administrative: 80, physical: 75 },
    { date: 'May', overall: 92, privacyRule: 100, securityRule: 94, breachNotification: 100, administrative: 83, physical: 78 },
  ];
  
  // Sample data for the radar chart
  const radarData = [
    { subject: 'Privacy', score: 100, fullMark: 100, previousScore: 95 },
    { subject: 'Security', score: 94, fullMark: 100, previousScore: 88 },
    { subject: 'Breach', score: 100, fullMark: 100, previousScore: 100 },
    { subject: 'Admin', score: 83, fullMark: 100, previousScore: 75 },
    { subject: 'Physical', score: 78, fullMark: 100, previousScore: 70 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Compliance Reports & Analytics</h2>
          <p className="text-slate-300">
            Detailed analytics, trends, and automated compliance recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
          <ComplianceExportButton 
            variant="default"
            className="bg-autheo-primary hover:bg-autheo-primary/90 text-slate-900"
          />
          <ExportAuditLogsButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ComplianceTrendChart data={trendData} />
        <ComplianceRadarChart data={radarData} />
      </div>
      
      <ComplianceRecommendations />
    </div>
  );
};

export default ComplianceReportsTab;
