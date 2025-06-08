
// Utility functions for health record filtering and management

export interface HealthRecord {
  id: string;
  title: string;
  category: string;
  provider: string;
  date: string;
  isShared: boolean;
  details?: string;
}

export interface FilterOptions {
  searchQuery?: string;
  category?: string;
  sharedFilter?: 'shared' | 'private';
}

export function filterHealthRecords(
  records: HealthRecord[],
  options: FilterOptions
): HealthRecord[] {
  let filtered = [...records];

  // Apply search query filter
  if (options.searchQuery && options.searchQuery.trim()) {
    const query = options.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(record =>
      record.title.toLowerCase().includes(query) ||
      record.provider.toLowerCase().includes(query) ||
      record.category.toLowerCase().includes(query) ||
      (record.details && record.details.toLowerCase().includes(query))
    );
  }

  // Apply category filter
  if (options.category && options.category !== 'all') {
    filtered = filtered.filter(record => record.category === options.category);
  }

  // Apply shared filter
  if (options.sharedFilter) {
    const isShared = options.sharedFilter === 'shared';
    filtered = filtered.filter(record => record.isShared === isShared);
  }

  // Sort by date (most recent first)
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return filtered;
}

export function getRecordCategories(records: HealthRecord[]): string[] {
  const categories = new Set(records.map(record => record.category));
  return Array.from(categories).sort();
}

export function getSharedRecordsCount(records: HealthRecord[]): number {
  return records.filter(record => record.isShared).length;
}

export function getRecentRecordsCount(records: HealthRecord[], days: number = 30): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return records.filter(record => new Date(record.date) >= cutoffDate).length;
}

export function validateHealthRecord(record: Partial<HealthRecord>): string[] {
  const errors: string[] = [];

  if (!record.title || record.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!record.category || record.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!record.provider || record.provider.trim().length === 0) {
    errors.push('Provider is required');
  }

  if (!record.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(record.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }

  return errors;
}
