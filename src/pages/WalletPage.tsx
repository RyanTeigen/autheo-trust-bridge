
import React, { useState, useMemo } from 'react';
import { Info, PlusCircle, Search, FileText, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import HealthRecordsList from '@/components/wallet/HealthRecordsList';
import { HealthRecordCardProps } from '@/components/ui/HealthRecordCard';
import RecordSummary from '@/components/wallet/RecordSummary';

const WalletPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'provider' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Mock data for demo
  const [healthRecords, setHealthRecords] = useState<Omit<HealthRecordCardProps, 'onToggleShare'>[]>([
    {
      id: '1',
      title: 'Hypertension Diagnosis',
      date: '2024-01-15',
      provider: 'Dr. Emily Chen',
      category: 'condition',
      details: 'Essential (primary) hypertension. Blood pressure reading: 145/92.',
      isShared: false
    },
    {
      id: '2',
      title: 'Complete Blood Count',
      date: '2023-11-02',
      provider: 'Aurora Advocate Lab',
      category: 'lab',
      details: 'WBC: 6.2, RBC: 4.8, Hemoglobin: 14.2, Hematocrit: 42.1%, Platelets: 250',
      isShared: true
    },
    {
      id: '3',
      title: 'Chest X-Ray',
      date: '2023-09-18',
      provider: 'Radiology Partners',
      category: 'imaging',
      details: 'No acute cardiopulmonary process. Heart size and pulmonary vascularity are within normal limits.',
      isShared: false
    },
    {
      id: '4',
      title: 'Lisinopril 10mg',
      date: '2024-01-15',
      provider: 'Dr. Emily Chen',
      category: 'medication',
      details: 'Take 1 tablet by mouth once daily. For hypertension management.',
      isShared: true
    },
    {
      id: '5',
      title: 'Annual Physical Exam',
      date: '2023-08-22',
      provider: 'Dr. James Wilson',
      category: 'visit',
      details: 'Routine annual physical examination. All vitals within normal range. Discussed preventive care.',
      isShared: false
    },
    {
      id: '6',
      title: 'Progress Note',
      date: '2024-02-10',
      provider: 'Dr. Emily Chen',
      category: 'note',
      details: 'Follow-up for hypertension. Patient reports good medication compliance. Blood pressure improved to 132/85.',
      isShared: false
    }
  ]);

  // Filtered and sorted records
  const processedRecords = useMemo(() => {
    let filtered = [...healthRecords];
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(record => record.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.title.toLowerCase().includes(query) ||
        record.provider.toLowerCase().includes(query) ||
        record.details.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'provider') {
        return sortOrder === 'asc' 
          ? a.provider.localeCompare(b.provider) 
          : b.provider.localeCompare(a.provider);
      } else {
        return sortOrder === 'asc' 
          ? a.category.localeCompare(b.category) 
          : b.category.localeCompare(a.category);
      }
    });
    
    return filtered;
  }, [healthRecords, searchQuery, sortBy, sortOrder, selectedCategory]);

  // Record statistics
  const recordStats = useMemo(() => {
    const total = healthRecords.length;
    const shared = healthRecords.filter(r => r.isShared).length;
    const categories = healthRecords.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      shared,
      categories
    };
  }, [healthRecords]);

  const handleToggleShare = (id: string, shared: boolean) => {
    setHealthRecords(records => 
      records.map(record => 
        record.id === id ? { ...record, isShared: shared } : record
      )
    );
    
    toast({
      title: shared ? "Record shared" : "Record unshared",
      description: `The selected health record has been ${shared ? 'added to' : 'removed from'} your shared data.`,
    });
  };

  // Unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set(healthRecords.map(record => record.category));
    return ['all', ...Array.from(uniqueCategories)];
  }, [healthRecords]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Smart Wallet</h1>
        <p className="text-muted-foreground">
          Control and manage access to your health records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Health Records</CardTitle>
            <CardDescription>
              Manage your complete medical history and control sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search records..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <div className="flex gap-2">
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => setSelectedCategory(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={sortBy} 
                  onValueChange={(value: 'date' | 'provider' | 'category') => setSortBy(value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="provider">Sort by Provider</SelectItem>
                    <SelectItem value="category">Sort by Category</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all">All Records</TabsTrigger>
                <TabsTrigger value="shared">Shared</TabsTrigger>
                <TabsTrigger value="private">Private</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <HealthRecordsList 
                  records={processedRecords} 
                  onToggleShare={handleToggleShare} 
                  filter="all" 
                />
              </TabsContent>
              
              <TabsContent value="shared" className="mt-0">
                <HealthRecordsList 
                  records={processedRecords} 
                  onToggleShare={handleToggleShare} 
                  filter="shared" 
                />
              </TabsContent>
              
              <TabsContent value="private" className="mt-0">
                <HealthRecordsList 
                  records={processedRecords} 
                  onToggleShare={handleToggleShare} 
                  filter="private" 
                />
              </TabsContent>
              
              <TabsContent value="recent" className="mt-0">
                <HealthRecordsList 
                  records={processedRecords} 
                  onToggleShare={handleToggleShare} 
                  filter="recent" 
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              {processedRecords.length} records found
            </div>
            {processedRecords.length === 0 && searchQuery && (
              <Badge variant="outline">No results for "{searchQuery}"</Badge>
            )}
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <RecordSummary stats={recordStats} />
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Smart Wallet Active</AlertTitle>
            <AlertDescription>
              Your Smart Wallet is secured with quantum-resistant encryption. You control who sees your data and when.
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle>Health Data Vault</CardTitle>
              <CardDescription>
                Import new health records from providers or upload documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Button className="w-full flex items-center justify-center gap-2" onClick={() => 
                  toast({
                    title: "Feature in Development",
                    description: "The ability to import records will be available soon.",
                  })
                }>
                  <PlusCircle className="h-4 w-4" />
                  Import from Provider
                </Button>
                <Button className="w-full flex items-center justify-center gap-2" variant="outline" onClick={() => 
                  toast({
                    title: "Feature in Development",
                    description: "The ability to upload documents will be available soon.",
                  })
                }>
                  <FileText className="h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
