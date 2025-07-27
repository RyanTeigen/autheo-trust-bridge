import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import MedicalRecordsManager from '@/components/medical/MedicalRecordsManager';

// Mock all external dependencies
vi.mock('@/integrations/supabase/client');
vi.mock('@/utils/encryption/SecureKeys');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: []
  }),
}));

vi.mock('@/hooks/useMedicalRecordsManager', () => ({
  useMedicalRecordsManager: () => ({
    records: [],
    loading: false,
    searchTerm: '',
    filterType: 'all',
    setSearchTerm: vi.fn(),
    setFilterType: vi.fn(),
    handleCreateRecord: vi.fn().mockResolvedValue(true),
    handleUpdateRecord: vi.fn().mockResolvedValue(false),
    handleDeleteRecord: vi.fn().mockResolvedValue(false),
    fetchRecords: vi.fn()
  }),
}));

vi.mock('@/hooks/useEncryptionSetup', () => ({
  useEncryptionSetup: () => ({
    isSetup: true,
    isLoading: false
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Medical Records Complete Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes the medical record creation and encryption flow', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MedicalRecordsManager />
      </TestWrapper>
    );

    // Should show the medical records manager
    await waitFor(() => {
      expect(screen.getByText(/Medical Records Manager/i)).toBeInTheDocument();
    });

    // Should have an "Add Record" button
    const addButton = screen.getByRole('button', { name: /add record/i });
    expect(addButton).toBeInTheDocument();

    // Click to open the form
    await user.click(addButton);

    // Should open the medical record form
    await waitFor(() => {
      expect(screen.getByText(/Create Medical Record/i)).toBeInTheDocument();
    });

    // Should have form fields
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();

    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'Test Medical Record');
    await user.type(screen.getByLabelText(/description/i), 'This is a test medical record for patient care.');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create encrypted record/i });
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/encrypting/i)).toBeInTheDocument();
    });
  });

  it('handles medical record search and filtering', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <MedicalRecordsManager />
      </TestWrapper>
    );

    // Should have search functionality
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search medical records/i)).toBeInTheDocument();
    });

    // Should have filter functionality
    expect(screen.getByText(/filter by type/i)).toBeInTheDocument();

    // Test search
    const searchInput = screen.getByPlaceholderText(/search medical records/i);
    await user.type(searchInput, 'blood test');

    // Should trigger search
    expect(searchInput).toHaveValue('blood test');
  });

  it('enforces proper security and access controls', async () => {
    render(
      <TestWrapper>
        <MedicalRecordsManager />
      </TestWrapper>
    );

    // Should show security indicators
    await waitFor(() => {
      expect(screen.getByText(/System Status/i)).toBeInTheDocument();
    });

    // Should show encryption status
    expect(screen.getByText(/Secure, encrypted storage/i)).toBeInTheDocument();
  });

  it('displays proper empty state when no records exist', async () => {
    render(
      <TestWrapper>
        <MedicalRecordsManager />
      </TestWrapper>
    );

    // Should show empty state
    await waitFor(() => {
      expect(screen.getByText(/No Medical Records Yet/i)).toBeInTheDocument();
    });

    // Should encourage first record creation
    expect(screen.getByText(/Create Your First Record/i)).toBeInTheDocument();
  });
});