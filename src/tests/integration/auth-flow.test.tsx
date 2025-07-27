import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { User, Session } from '@supabase/supabase-js';
import App from '@/App';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
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
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock auth subscription
    const mockSubscription = { 
      unsubscribe: vi.fn(),
      id: 'test-subscription',
      callback: vi.fn()
    };
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({ 
      data: { subscription: mockSubscription } 
    });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    });
  });

  it('redirects unauthenticated users to auth page', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/autheo health/i)).toBeInTheDocument();
      expect(screen.getByText(/authenticate with your digital identity/i)).toBeInTheDocument();
    });
  });

  it('shows patient dashboard for authenticated users', async () => {
    const mockUser = { 
      id: '123', 
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as User;
    const mockSession = { 
      user: mockUser,
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: 3600,
      token_type: 'bearer'
    } as Session;
    
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    });

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/medical records/i)).toBeInTheDocument();
    });
  });
});