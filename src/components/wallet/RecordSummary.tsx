
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Records Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-violet-100 rounded-full">
            <Wallet className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Total Records</p>
            <p className="text-2xl font-bold">{total}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Shared with providers</span>
            <span className="font-medium">{shared}/{total}</span>
          </div>
          <Progress value={sharedPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">{sharedPercentage}% of records are shared</p>
        </div>
        
        {sortedCategories.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Top Categories</p>
            <div className="space-y-2">
              {sortedCategories.map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${getCategoryColor(category).replace('text', 'bg')}`} />
                    <span className="text-sm capitalize">{category}</span>
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-full">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm">Provider Access</p>
            <p className="text-sm font-medium">{shared > 0 ? 'Active' : 'None'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordSummary;
