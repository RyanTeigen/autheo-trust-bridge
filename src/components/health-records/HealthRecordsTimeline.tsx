
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  FileText, 
  Heart, 
  Calendar, 
  FileSearch, 
  Syringe, 
  TestTube
} from 'lucide-react';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';

const HealthRecordsTimeline: React.FC = () => {
  const { healthRecords } = useHealthRecords();
  
  // Sort records by date (newest first)
  const sortedRecords = [...healthRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'condition': return <Heart className="h-4 w-4" />;
      case 'lab': return <FileSearch className="h-4 w-4" />;
      case 'imaging': return <FileText className="h-4 w-4" />;
      case 'immunization': return <Syringe className="h-4 w-4" />;
      case 'visit': return <Calendar className="h-4 w-4" />;
      case 'allergy': return <Pill className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'medication': return 'bg-blue-100/20 text-blue-300 border-blue-300/30';
      case 'condition': return 'bg-red-100/20 text-red-300 border-red-300/30';
      case 'lab': return 'bg-purple-100/20 text-purple-300 border-purple-300/30';
      case 'imaging': return 'bg-amber-100/20 text-amber-300 border-amber-300/30';
      case 'note': return 'bg-green-100/20 text-green-300 border-green-300/30';
      case 'visit': return 'bg-teal-100/20 text-teal-300 border-teal-300/30';
      case 'immunization': return 'bg-indigo-100/20 text-indigo-300 border-indigo-300/30';
      case 'allergy': return 'bg-orange-100/20 text-orange-300 border-orange-300/30';
      default: return 'bg-slate-100/20 text-slate-300 border-slate-300/30';
    }
  };

  // Group records by month and year
  const groupedRecords = sortedRecords.reduce<Record<string, typeof sortedRecords>>((groups, record) => {
    const date = new Date(record.date);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(record);
    return groups;
  }, {});

  // Get unique months sorted by date
  const sortedMonths = Object.keys(groupedRecords).sort((a, b) => {
    const [yearA, monthA] = a.split('-').map(Number);
    const [yearB, monthB] = b.split('-').map(Number);
    return yearB - yearA || monthB - monthA;
  });

  const formatMonthYear = (key: string) => {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-8">
      {sortedMonths.map((monthKey) => (
        <div key={monthKey}>
          <h3 className="text-autheo-primary font-semibold mb-3">{formatMonthYear(monthKey)}</h3>
          <div className="ml-4 border-l-2 border-slate-700 pl-6 space-y-6">
            {groupedRecords[monthKey].map((record) => (
              <div key={record.id} className="relative">
                <div className="absolute -left-10 mt-1 rounded-full bg-slate-700 border-4 border-slate-800 p-1">
                  {getCategoryIcon(record.category)}
                </div>
                <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-autheo-primary">{record.title}</h4>
                        <p className="text-sm text-slate-300">{record.provider}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(record.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant="outline" 
                          className={getCategoryColor(record.category)}
                        >
                          {record.category.charAt(0).toUpperCase() + record.category.slice(1)}
                        </Badge>
                        <Badge 
                          variant={record.isShared ? "secondary" : "outline"} 
                          className="text-xs"
                        >
                          {record.isShared ? 'Shared' : 'Private'}
                        </Badge>
                      </div>
                    </div>
                    {record.details && (
                      <div className="mt-2 p-2 bg-slate-700/30 rounded-md text-sm text-slate-300">
                        {record.details}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HealthRecordsTimeline;
