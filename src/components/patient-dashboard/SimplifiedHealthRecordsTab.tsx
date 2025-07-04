import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  Share2, 
  Download, 
  Upload, 
  Plus,
  Shield,
  Clock
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Mock data for better UX
const mockPersonalRecords = [
  {
    id: '1',
    record_type: 'Lab Results - Blood Work',
    created_at: '2024-12-15T10:30:00Z',
    provider: 'My Lab Upload',
    status: 'completed',
    integrity: { hasHash: true, isAnchored: true, anchoredAt: '2024-12-15T11:00:00Z' }
  },
  {
    id: '2', 
    record_type: 'Annual Physical Exam',
    created_at: '2024-11-20T14:15:00Z',
    provider: 'Self-Recorded',
    status: 'completed',
    integrity: { hasHash: true, isAnchored: false }
  },
  {
    id: '3',
    record_type: 'Vaccination Record - COVID',
    created_at: '2024-10-10T09:00:00Z',
    provider: 'Imported Document',
    status: 'completed',
    integrity: { hasHash: false, isAnchored: false }
  }
];

const mockSharedRecords = [
  {
    id: '4',
    record_type: 'Cardiac Stress Test',
    created_at: '2024-12-01T16:20:00Z',
    provider: 'Dr. Sarah Johnson',
    provider_specialty: 'Cardiology',
    shared_at: '2024-12-01T17:00:00Z',
    access_level: 'read',
    expires_at: '2025-01-01T00:00:00Z'
  },
  {
    id: '5',
    record_type: 'MRI Scan Results',
    created_at: '2024-11-15T11:45:00Z',
    provider: 'Dr. Michael Chen',
    provider_specialty: 'Radiology',
    shared_at: '2024-11-15T12:00:00Z',
    access_level: 'read',
    expires_at: '2024-12-15T00:00:00Z'
  }
];

interface SimplifiedHealthRecordsTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  handleToggleShare: (id: string, shared: boolean) => void;
}

const SimplifiedHealthRecordsTab: React.FC<SimplifiedHealthRecordsTabProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  handleToggleShare,
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const { toast } = useToast();

  const filteredPersonalRecords = mockPersonalRecords.filter(record => {
    const matchesSearch = record.record_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      record.record_type.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const filteredSharedRecords = mockSharedRecords.filter(record => {
    const matchesSearch = record.record_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleImportSuccess = () => {
    toast({
      title: "Record Imported",
      description: "Your medical record has been successfully imported.",
    });
  };

  const handleAddRecord = () => {
    setShowAddDialog(false);
    toast({
      title: "Record Added",
      description: "Your medical record has been added successfully.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-200">Health Records</h2>
          <p className="text-slate-400">Manage your personal and shared medical records</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleImportSuccess}
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button variant="autheo" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Medical Record</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-slate-400 mb-4">Record form would go here...</p>
                <div className="flex gap-2">
                  <Button onClick={handleAddRecord} variant="autheo">
                    Save Record
                  </Button>
                  <Button onClick={() => setShowAddDialog(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search health records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-slate-200"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-800 border-slate-600 text-slate-200">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="all">All Records</SelectItem>
            <SelectItem value="lab">Lab Results</SelectItem>
            <SelectItem value="exam">Physical Exams</SelectItem>
            <SelectItem value="vaccination">Vaccinations</SelectItem>
            <SelectItem value="imaging">Imaging</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Records Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
          <TabsTrigger 
            value="personal" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
          >
            My Records ({filteredPersonalRecords.length})
          </TabsTrigger>
          <TabsTrigger 
            value="shared" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
          >
            Shared with Me ({filteredSharedRecords.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-6">
          <div className="grid gap-4">
            {filteredPersonalRecords.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400 opacity-50" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No Personal Records Found</h3>
                  <p className="text-slate-400 mb-4">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Add your first medical record to get started'
                    }
                  </p>
                  <Button onClick={() => setShowAddDialog(true)} variant="autheo">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Record
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredPersonalRecords.map((record) => (
                <Card key={record.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-autheo-primary/20 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-autheo-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-slate-200 text-lg">{record.record_type}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-400">
                              {formatDate(record.created_at)} • {record.provider}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-900/20 text-green-400 border-green-800">
                          Personal
                        </Badge>
                        {record.integrity?.hasHash && (
                          <Badge variant="secondary" className="bg-purple-900/20 text-purple-400 border-purple-800">
                            {record.integrity.isAnchored ? 'Anchored' : 'Hashed'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-400">
                        <div>Record ID: {record.id}</div>
                        {record.integrity?.anchoredAt && (
                          <div className="mt-1">Anchored: {formatDate(record.integrity.anchoredAt)}</div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleShare(record.id, false)}
                          className="text-slate-300 border-slate-600 hover:bg-slate-700"
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-slate-300 border-slate-600 hover:bg-slate-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="shared" className="mt-6">
          <div className="grid gap-4">
            {filteredSharedRecords.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <Share2 className="h-16 w-16 mx-auto mb-4 text-slate-400 opacity-50" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No Shared Records</h3>
                  <p className="text-slate-400">
                    Records shared with you by healthcare providers will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredSharedRecords.map((record) => (
                <Card key={record.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-slate-200 text-lg">{record.record_type}</CardTitle>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-400">
                                {record.provider} • {record.provider_specialty}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-400">
                                {formatDate(record.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-blue-900/20 text-blue-400 border-blue-800">
                          Shared
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {record.access_level}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-400">
                        <div>Shared: {formatDateTime(record.shared_at)}</div>
                        <div className="mt-1 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Expires: {formatDate(record.expires_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-slate-300 border-slate-600 hover:bg-slate-700"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimplifiedHealthRecordsTab;