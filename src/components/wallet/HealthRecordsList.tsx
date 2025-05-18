
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  FileSearch, 
  Share2, 
  Pill, 
  FileText, 
  Heart, 
  Calendar, 
  Syringe, 
  TestTube,
  AlertCircle 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useHealthRecords } from '@/contexts/HealthRecordsContext';
import { useNavigate } from 'react-router-dom';
import { filterHealthRecords } from '@/utils/healthRecordUtils';

interface HealthRecordsListProps {
  onToggleShare: (id: string, shared: boolean) => void;
  filter?: 'all' | 'shared' | 'private' | 'recent';
  searchQuery?: string;
  selectedCategory?: string;
}

const HealthRecordsList: React.FC<HealthRecordsListProps> = ({ 
  onToggleShare,
  filter = 'all',
  searchQuery = '',
  selectedCategory = 'all'
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { healthRecords } = useHealthRecords();

  // Get filtered records using the utility function
  const filteredRecords = filterHealthRecords(healthRecords, {
    searchQuery,
    category: selectedCategory,
    sharedFilter: filter === 'all' ? undefined : (filter === 'shared' ? 'shared' : 'private')
  });
  
  const handleShare = (recordId: string, currentlyShared: boolean) => {
    // Toggle sharing status
    onToggleShare(recordId, !currentlyShared);
    
    // Show toast confirmation
    toast({
      title: !currentlyShared ? "Record shared" : "Record unshared",
      description: `The health record is now ${!currentlyShared ? 'shared' : 'private'}.`,
    });
  };

  const handleManageAccess = (recordId: string) => {
    toast({
      title: "Manage access",
      description: "Redirecting to access management for this record.",
    });
    
    navigate('/shared-records');
  };

  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'medication': return <Pill className="h-4 w-4" />;
      case 'condition': return <Heart className="h-4 w-4" />;
      case 'lab': return <TestTube className="h-4 w-4" />;
      case 'imaging': return <FileSearch className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      case 'visit': return <Calendar className="h-4 w-4" />;
      case 'immunization': return <Syringe className="h-4 w-4" />;
      case 'allergy': return <AlertCircle className="h-4 w-4" />;
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

  if (filteredRecords.length === 0) {
    return (
      <Alert variant="default" className="bg-slate-50 border-dashed text-sm p-3">
        <FileSearch className="h-4 w-4" />
        <AlertDescription className="text-sm">
          No records found. {filter !== 'all' && `Try switching to a different filter or tab.`}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {filteredRecords.map(record => (
        <div key={record.id} className="relative">
          <Card className={`bg-slate-800/50 border-slate-700/50 overflow-hidden hover:border-autheo-primary/40 transition-all duration-200 ${record.isShared ? 'border-l-4 border-l-autheo-primary' : ''}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="mt-1 p-1.5 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center">
                    {getCategoryIcon(record.category)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-autheo-primary">{record.title}</h4>
                    <p className="text-sm text-slate-300">{record.provider}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
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
                    className="text-xs cursor-pointer"
                    onClick={() => handleShare(record.id, record.isShared)}
                  >
                    {record.isShared ? 'Shared' : 'Private'}
                  </Badge>
                  {record.isShared && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 hover:bg-autheo-primary/20"
                      onClick={() => handleManageAccess(record.id)}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
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
  );
};

export default HealthRecordsList;
