
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { HealthRecordCardProps } from '@/components/ui/HealthRecordCard';
import RecordSummary from '@/components/wallet/RecordSummary';
import WalletHeader from '@/components/wallet/WalletHeader';
import WalletFilters from '@/components/wallet/WalletFilters';
import WalletTabsContainer from '@/components/wallet/WalletTabsContainer';
import DataVaultCard from '@/components/wallet/DataVaultCard';
import WalletInfoAlert from '@/components/wallet/WalletInfoAlert';

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

  // Unique categories for filtering
  const categories = useMemo(() => {
    const uniqueCategories = new Set(healthRecords.map(record => record.category));
    return ['all', ...Array.from(uniqueCategories)];
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

  return (
    <div className="space-y-6">
      <WalletHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle>Your Health Records</CardTitle>
            <CardDescription>
              Manage your medical history and control sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <WalletFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              categories={categories}
            />
            
            <WalletTabsContainer
              processedRecords={processedRecords}
              handleToggleShare={handleToggleShare}
              searchQuery={searchQuery}
            />
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <RecordSummary stats={recordStats} />
          <WalletInfoAlert />
          <DataVaultCard />
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
