import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Mock the Supabase client
vi.mock('@/integrations/supabase/client');
vi.mock('@/utils/encryption/SecureKeys');

const TestComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <div data-testid="user">{user?.email || 'No user'}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides initial loading state', () => {
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

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('No user');
  });

  it('handles authentication state changes', async () => {
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
    const mockSubscription = { 
      unsubscribe: vi.fn(),
      id: 'test-subscription',
      callback: vi.fn()
    };

    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({ 
      data: { subscription: mockSubscription } 
    });
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
  });
});