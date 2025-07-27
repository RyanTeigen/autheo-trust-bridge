import React from 'react';
import { BarChart3 } from 'lucide-react';
import PageHeader from '@/components/dashboard/PageHeader';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';

const AdvancedAnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Advanced Analytics"
        description="Comprehensive healthcare data analytics and insights"
        icon={<BarChart3 className="h-8 w-8 text-blue-600" />}
      />
      
      <AdvancedAnalyticsDashboard />
    </div>
  );
};

export default AdvancedAnalyticsPage;