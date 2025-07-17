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
  Shield,
  Clock,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ExportRecordsButton from '@/components/patient/ExportRecordsButton';
import NotificationDrivenApprovalAlert from '@/components/patient/NotificationDrivenApprovalAlert';

// Mock data for better UX
const mockPersonalRecords = [
  {
    id: '1',
    record_type: 'Lab Results - Blood Work',
    created_at: '2024-12-15T10:30:00Z',
    provider: 'Dr. Martinez - Primary Care',
    status: 'completed',
    integrity: { hasHash: true, isAnchored: true, anchoredAt: '2024-12-15T11:00:00Z' }
  },
  {
    id: '2', 
    record_type: 'Annual Physical Exam',
    created_at: '2024-11-20T14:15:00Z',
    provider: 'Dr. Thompson - Family Medicine',
    status: 'completed',
    integrity: { hasHash: true, isAnchored: false }
  },
  {
    id: '3',
    record_type: 'Vaccination Record - COVID',
    created_at: '2024-10-10T09:00:00Z',
    provider: 'City Health Department',
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
          <p className="text-slate-400">View your medical records created by healthcare providers</p>
        </div>
        
        <div className="flex gap-2">
          <ExportRecordsButton 
            variant="outline" 
            size="sm"
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          />
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
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
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
          <TabsTrigger 
            value="requests" 
            className="text-slate-300 data-[state=active]:bg-autheo-primary data-[state=active]:text-slate-900"
          >
            Access Requests
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
                      : 'Medical records created by healthcare providers will appear here'
                    }
                  </p>
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
                        
                        <ExportRecordsButton 
                          variant="outline"
                          size="sm"
                          className="text-slate-300 border-slate-600 hover:bg-slate-700"
                        />
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
        
        <TabsContent value="requests" className="mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-autheo-primary/20 p-2 rounded-lg">
                  <UserCheck className="h-5 w-5 text-autheo-primary" />
                </div>
                <div>
                  <CardTitle className="text-slate-200">Access Requests Management</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">
                    Manage healthcare provider requests to access your medical records
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-slate-200 mb-2">Streamlined Access Management</h4>
                      <p className="text-sm text-slate-400 mb-3">
                        We've simplified access request management. New requests appear as notifications at the top of your dashboard where you can quickly approve or deny them.
                      </p>
                      <ul className="text-sm text-slate-400 space-y-1">
                        <li>• Instant notifications for new access requests</li>
                        <li>• Quick approve/deny buttons right from the notification</li>
                        <li>• Detailed review option if you need more information</li>
                        <li>• All actions are logged for your security</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Embedded notification component for immediate access */}
                <div className="border border-slate-700 rounded-lg">
                  <div className="p-4 border-b border-slate-700">
                    <h4 className="font-medium text-slate-200">Current Access Requests</h4>
                    <p className="text-sm text-slate-400">Active notifications requiring your attention</p>
                  </div>
                  <div className="p-1">
                    <NotificationDrivenApprovalAlert />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimplifiedHealthRecordsTab;