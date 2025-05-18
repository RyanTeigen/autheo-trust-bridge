
import React from 'react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import ImprovedHealthRecordsView from '@/components/health-records/ImprovedHealthRecordsView';
import DecentralizedFeatures from '@/components/wallet/DecentralizedFeatures';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface HealthRecordsTabProps {
  handleToggleShare: (id: string, shared: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

const HealthRecordsTab: React.FC<HealthRecordsTabProps> = ({
  handleToggleShare,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory
}) => {
  return (
    <div className="space-y-6">
      {/* Improved health records view with consistent styling */}
      <ImprovedHealthRecordsView />
      
      {/* Decentralized Features Section */}
      <Card className="bg-slate-800 border-slate-700 text-slate-100">
        <CardHeader className="border-b border-slate-700 bg-slate-700/30">
          <CardTitle className="text-autheo-primary">Decentralized Health Features</CardTitle>
          <CardDescription className="text-slate-300">
            Blockchain-powered security for your health records
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <DecentralizedFeatures />
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthRecordsTab;
