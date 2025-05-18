import React from 'react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileLock2, 
  Share2, 
  Calendar, 
  Clock, 
  PieChart,
  UserRound
} from 'lucide-react';

const HealthRecordsStats: React.FC = () => {
  const { summary, healthRecords } = useHealthRecords();
  
  // Get the latest record date
  const getLatestRecordDate = () => {
    if (healthRecords.length === 0) return 'No records';
    
    const dates = healthRecords.map(r => new Date(r.date).getTime());
    const latestDate = new Date(Math.max(...dates));
    
    // If within last 7 days, show "X days ago"
    const daysAgo = Math.floor((Date.now() - latestDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo < 7) {
      return daysAgo === 0 ? 'Today' : `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
    }
    
    // Otherwise show full date
    return latestDate.toLocaleDateString();
  };
  
  // Get count of unique providers
  const getUniqueProviders = () => {
    const providers = new Set(healthRecords.map(r => r.provider));
    return providers.size;
  };
  
  // Get the date range of records
  const getRecordDateRange = () => {
    if (healthRecords.length === 0) return 'No records';
    
    const dates = healthRecords.map(r => new Date(r.date).getTime());
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));
    
    const monthsRange = Math.floor((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    return `${monthsRange} month${monthsRange > 1 ? 's' : ''}`;
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex flex-col items-center">
            <div className="mb-2 mt-1 p-1.5 rounded-full bg-autheo-primary/20">
              <FileLock2 className="h-5 w-5 text-autheo-primary" />
            </div>
            <span className="text-2xl font-bold text-autheo-primary">{summary.total}</span>
            <span className="text-xs text-slate-300 mt-1">Total Records</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex flex-col items-center">
            <div className="mb-2 mt-1 p-1.5 rounded-full bg-autheo-primary/20">
              <Share2 className="h-5 w-5 text-autheo-primary" />
            </div>
            <span className="text-2xl font-bold text-autheo-primary">{summary.shared}</span>
            <span className="text-xs text-slate-300 mt-1">Shared Records</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex flex-col items-center">
            <div className="mb-2 mt-1 p-1.5 rounded-full bg-autheo-primary/20">
              <PieChart className="h-5 w-5 text-autheo-primary" />
            </div>
            <span className="text-2xl font-bold text-autheo-primary">{Object.keys(summary.categories).length}</span>
            <span className="text-xs text-slate-300 mt-1">Categories</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex flex-col items-center">
            <div className="mb-2 mt-1 p-1.5 rounded-full bg-autheo-primary/20">
              <UserRound className="h-5 w-5 text-autheo-primary" />
            </div>
            <span className="text-2xl font-bold text-autheo-primary">{getUniqueProviders()}</span>
            <span className="text-xs text-slate-300 mt-1">Providers</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex flex-col items-center">
            <div className="mb-2 mt-1 p-1.5 rounded-full bg-autheo-primary/20">
              <Clock className="h-5 w-5 text-autheo-primary" />
            </div>
            <span className="text-xl font-bold text-autheo-primary">{getLatestRecordDate()}</span>
            <span className="text-xs text-slate-300 mt-1">Last Update</span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700/50">
        <CardContent className="p-3">
          <div className="flex flex-col items-center">
            <div className="mb-2 mt-1 p-1.5 rounded-full bg-autheo-primary/20">
              <Calendar className="h-5 w-5 text-autheo-primary" />
            </div>
            <span className="text-xl font-bold text-autheo-primary">{getRecordDateRange()}</span>
            <span className="text-xs text-slate-300 mt-1">History Span</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthRecordsStats;
