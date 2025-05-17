
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Users, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RecordSummaryProps {
  stats: {
    total: number;
    shared: number;
    categories: Record<string, number>;
  };
}

const RecordSummary: React.FC<RecordSummaryProps> = ({ stats }) => {
  const { total, shared, categories } = stats;
  const sharedPercentage = total > 0 ? Math.round((shared / total) * 100) : 0;
  
  // Get top categories
  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Color mapping for different categories
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'medication': return 'text-blue-600';
      case 'condition': return 'text-red-600';
      case 'lab': return 'text-purple-600';
      case 'imaging': return 'text-amber-600';
      case 'note': return 'text-green-600';
      case 'visit': return 'text-teal-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card className="border-slate-200 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-autheo-secondary to-autheo-accent" />
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5 text-autheo-secondary" />
          Records Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-50 rounded-full">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">Total Records</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Shared with providers</span>
            <span className="font-medium">{shared}/{total}</span>
          </div>
          <Progress value={sharedPercentage} className="h-2" 
            style={{ 
              background: 'rgb(241 245 249)',
              '--progress-background': 'linear-gradient(to right, #5EEBC4, #4A6BF5)'
            } as React.CSSProperties}
          />
          <p className="text-xs text-muted-foreground">{sharedPercentage}% of records are shared</p>
        </div>
        
        {sortedCategories.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Top Categories</p>
            <div className="space-y-2.5">
              {sortedCategories.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${getCategoryColor(category).replace('text', 'bg')}`} />
                    <span className="text-sm capitalize text-slate-700">{category}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-purple-50 rounded-full">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600">Provider Access</p>
            <p className="text-sm font-medium">{shared > 0 ? 'Active' : 'None'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordSummary;
