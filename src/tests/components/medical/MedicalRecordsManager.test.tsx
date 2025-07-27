import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MedicalRecordsManager from '@/components/medical/MedicalRecordsManager';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the entire medical records service
vi.mock('@/services/EnhancedMedicalRecordsService', () => ({
  enhancedMedicalRecordsService: {
    getRecords: vi.fn().mockResolvedValue({ success: true, data: [] }),
    createRecord: vi.fn(),
    updateRecord: vi.fn(),
    deleteRecord: vi.fn(),
  },
}));

vi.mock('@/integrations/supabase/client');
vi.mock('@/utils/encryption/SecureKeys');

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('MedicalRecordsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(
      <TestWrapper>
        <MedicalRecordsManager />
      </TestWrapper>
    );

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  it('renders empty state when no records exist', async () => {
    render(
      <TestWrapper>
        <MedicalRecordsManager />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/no medical records found/i)).toBeInTheDocument();
    });
  });
});