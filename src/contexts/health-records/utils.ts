
import { HealthRecord, HealthRecordsSummary } from './types';

export const calculateSummary = (records: HealthRecord[]): HealthRecordsSummary => {
  const total = records.length;
  const shared = records.filter(r => r.isShared).length;
  const pending = 2; // Mock number for pending shared records
  
  const categories = records.reduce((acc, record) => {
    acc[record.category] = (acc[record.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total,
    shared,
    pending,
    categories
  };
};

export const getRecordsByCategory = (records: HealthRecord[], category: string): HealthRecord[] => {
  if (category === 'all') return records;
  return records.filter(record => record.category === category);
};

export const getRecordsByFilter = (
  records: HealthRecord[], 
  filter: 'all' | 'shared' | 'private' | 'recent'
): HealthRecord[] => {
  switch (filter) {
    case 'shared':
      return records.filter(record => record.isShared);
    case 'private':
      return records.filter(record => !record.isShared);
    case 'recent':
      return [...records]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
    case 'all':
    default:
      return records;
  }
};
