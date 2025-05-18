
import { HealthRecord } from '@/contexts/HealthRecordsContext';

export const filterHealthRecords = (
  records: HealthRecord[],
  options: {
    searchQuery?: string;
    category?: string;
    dateRange?: { start: string | null; end: string | null };
    sharedFilter?: 'all' | 'shared' | 'private';
    provider?: string;
  }
) => {
  const { searchQuery, category, dateRange, sharedFilter, provider } = options;
  
  return records.filter(record => {
    // Filter by search query
    if (searchQuery && !record.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !record.provider.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !record.details.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (category && category !== 'all' && record.category !== category) {
      return false;
    }
    
    // Filter by date range
    if (dateRange?.start) {
      const recordDate = new Date(record.date);
      const startDate = new Date(dateRange.start);
      if (recordDate < startDate) {
        return false;
      }
    }
    
    if (dateRange?.end) {
      const recordDate = new Date(record.date);
      const endDate = new Date(dateRange.end);
      // Set end date to the end of the day
      endDate.setHours(23, 59, 59, 999);
      if (recordDate > endDate) {
        return false;
      }
    }
    
    // Filter by shared status
    if (sharedFilter === 'shared' && !record.isShared) {
      return false;
    }
    
    if (sharedFilter === 'private' && record.isShared) {
      return false;
    }
    
    // Filter by provider
    if (provider && provider !== 'all' && record.provider !== provider) {
      return false;
    }
    
    return true;
  });
};

export const formatDateToLocale = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export const getCategoryIcon = (category: string) => {
  return category.charAt(0).toUpperCase() + category.slice(1);
};

export const getSharingStatusText = (isShared: boolean): string => {
  return isShared ? 'Shared with providers' : 'Private';
};
