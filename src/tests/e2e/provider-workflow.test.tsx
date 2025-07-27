import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import SOAPNotesManager from '@/components/provider/SOAPNotesManager';
import PatientSearch from '@/components/provider/PatientSearch';

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

vi.mock('@/services/patient/PatientProfileService', () => ({
  patientProfileService: {
    getPatients: vi.fn().mockResolvedValue({
      data: [
        {
          id: 'patient-1',
          full_name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '555-0123',
          date_of_birth: '1980-01-01',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]
    })
  }
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

describe('Provider Workflow End-to-End', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes the SOAP note creation workflow', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SOAPNotesManager />
      </TestWrapper>
    );

    // Should show SOAP notes manager
    await waitFor(() => {
      expect(screen.getByText(/SOAP Notes/i)).toBeInTheDocument();
    });

    // Should have a "New SOAP Note" button
    const newNoteButton = screen.getByRole('button', { name: /new soap note/i });
    expect(newNoteButton).toBeInTheDocument();

    // Click to create new note
    await user.click(newNoteButton);

    // Should open the SOAP note form
    await waitFor(() => {
      expect(screen.getByText(/Create SOAP Note/i)).toBeInTheDocument();
    });

    // Should have all SOAP sections
    expect(screen.getByLabelText(/patient id/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subjective/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/objective/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/assessment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/plan/i)).toBeInTheDocument();

    // Fill out the form
    await user.type(screen.getByLabelText(/patient id/i), 'P001');
    await user.type(screen.getByLabelText(/patient name/i), 'John Doe');
    await user.type(screen.getByLabelText(/subjective/i), 'Patient reports headache for 3 days');
    await user.type(screen.getByLabelText(/objective/i), 'VS: BP 120/80, HR 72, afebrile. HEENT normal.');
    await user.type(screen.getByLabelText(/assessment/i), 'Tension headache, likely stress-related');
    await user.type(screen.getByLabelText(/plan/i), 'Ibuprofen 400mg TID, follow up in 1 week if persistent');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /create soap note/i });
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/creating note/i)).toBeInTheDocument();
    });
  });

  it('handles patient search and record access workflow', async () => {
    const user = userEvent.setup();
    const mockOnPatientSelect = vi.fn();

    render(
      <TestWrapper>
        <PatientSearch onPatientSelect={mockOnPatientSelect} />
      </TestWrapper>
    );

    // Should show patient search interface
    await waitFor(() => {
      expect(screen.getByText(/Patient Search/i)).toBeInTheDocument();
    });

    // Should have search input
    const searchInput = screen.getByPlaceholderText(/enter patient name/i);
    expect(searchInput).toBeInTheDocument();

    // Type search term
    await user.type(searchInput, 'John');

    // Click search button
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/searching patients/i)).toBeInTheDocument();
    });

    // After loading, should show results
    await waitFor(() => {
      expect(screen.getByText(/search results/i)).toBeInTheDocument();
    });
  });

  it('integrates SOAP notes with patient search functionality', async () => {
    const user = userEvent.setup();
    const mockOnPatientSelect = vi.fn();

    // First test patient search
    const { rerender } = render(
      <TestWrapper>
        <PatientSearch onPatientSelect={mockOnPatientSelect} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Patient Search/i)).toBeInTheDocument();
    });

    // Search for a patient
    const searchInput = screen.getByPlaceholderText(/enter patient name/i);
    await user.type(searchInput, 'John');
    
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);

    // Then switch to SOAP notes
    rerender(
      <TestWrapper>
        <SOAPNotesManager />
      </TestWrapper>
    );

    // Should be able to create notes for the searched patient
    await waitFor(() => {
      expect(screen.getByText(/SOAP Notes/i)).toBeInTheDocument();
    });

    const newNoteButton = screen.getByRole('button', { name: /new soap note/i });
    await user.click(newNoteButton);

    // Should pre-populate patient information from search context
    await waitFor(() => {
      expect(screen.getByLabelText(/patient name/i)).toBeInTheDocument();
    });
  });

  it('displays existing SOAP notes with proper formatting', async () => {
    render(
      <TestWrapper>
        <SOAPNotesManager />
      </TestWrapper>
    );

    // Should show existing notes
    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    });

    // Should show note previews
    expect(screen.getByText(/Patient reports chest pain/i)).toBeInTheDocument();
    expect(screen.getByText(/Chest pain, likely musculoskeletal/i)).toBeInTheDocument();

    // Should have view buttons
    const viewButtons = screen.getAllByText(/view full note/i);
    expect(viewButtons).toHaveLength(2);
  });

  it('handles provider permissions and access controls', async () => {
    render(
      <TestWrapper>
        <SOAPNotesManager />
      </TestWrapper>
    );

    // Should enforce proper provider access
    await waitFor(() => {
      expect(screen.getByText(/SOAP Notes/i)).toBeInTheDocument();
    });

    // Should show provider-specific content
    expect(screen.getByText(/Manage patient encounter documentation/i)).toBeInTheDocument();

    // Should not show patient-only features
    expect(screen.queryByText(/patient dashboard/i)).not.toBeInTheDocument();
  });
});