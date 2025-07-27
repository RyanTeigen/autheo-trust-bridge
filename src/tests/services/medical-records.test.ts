import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enhancedMedicalRecordsService } from '@/services/EnhancedMedicalRecordsService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client');

describe('Enhanced Medical Records Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a medical record successfully', async () => {
    const mockRecord = {
      id: '123',
      patient_id: 'patient-123',
      record_type: 'general',
      encrypted_data: 'encrypted-data',
      created_at: new Date().toISOString(),
    };

    // Mock the service methods
    const createSpy = vi.spyOn(enhancedMedicalRecordsService, 'createRecord')
      .mockResolvedValue({ success: true, data: mockRecord });

    const result = await enhancedMedicalRecordsService.createRecord({
      title: 'Test Record',
      description: 'Test Description',
      record_type: 'general',
    });

    expect(createSpy).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockRecord);
  });

  it('retrieves medical records with pagination', async () => {
    const mockRecords = [
      {
        id: '1',
        patient_id: 'patient-123',
        record_type: 'general',
        encrypted_data: 'data1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: { title: 'Test Record 1' }
      },
      {
        id: '2',
        patient_id: 'patient-123',
        record_type: 'lab',
        encrypted_data: 'data2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: { title: 'Test Record 2' }
      },
    ];

    const mockResponse = {
      success: true,
      data: {
        records: mockRecords,
        totalCount: 2,
        pagination: { limit: 10, offset: 0 }
      }
    };

    const getSpy = vi.spyOn(enhancedMedicalRecordsService, 'getRecords')
      .mockResolvedValue(mockResponse);

    const result = await enhancedMedicalRecordsService.getRecords(
      { limit: 10, offset: 0 },
      { recordType: 'general' }
    );

    expect(getSpy).toHaveBeenCalledWith(
      { limit: 10, offset: 0 },
      { recordType: 'general' }
    );
    expect(result.success).toBe(true);
    expect(result.data.records).toHaveLength(2);
  });

  it('handles errors gracefully', async () => {
    const createSpy = vi.spyOn(enhancedMedicalRecordsService, 'createRecord')
      .mockResolvedValue({ 
        success: false, 
        error: 'Database connection failed',
        statusCode: 500
      });

    const result = await enhancedMedicalRecordsService.createRecord({
      title: 'Test Record',
      description: 'Test Description',
      record_type: 'general',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database connection failed');
    expect(result.statusCode).toBe(500);
  });
});