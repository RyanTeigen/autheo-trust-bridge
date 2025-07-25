
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ensureUserKeys } from '@/utils/encryption/SecureKeys';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  profile: any;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  profile: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Computed properties
  const isLoading = loading;
  const isAuthenticated = !!user;

  const fetchProfile = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const setupUserEncryption = async (userId: string) => {
    try {
      await ensureUserKeys(userId);
      console.log('Encryption keys setup completed for user:', userId);
      return true;
    } catch (error) {
      console.error('Failed to setup encryption keys:', error);
      // Set a fallback indicator for encryption setup failure
      setProfile(prev => ({ ...prev, _encryptionSetupFailed: true }));
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Setup encryption keys and fetch profile with better error handling
          setTimeout(async () => {
            try {
              const [encryptionSuccess] = await Promise.allSettled([
                setupUserEncryption(session.user.id),
                fetchProfile(session.user.id)
              ]);
              
              if (encryptionSuccess.status === 'rejected') {
                console.warn('Encryption setup failed, but user can still access the app with limited functionality');
              }
            } catch (error) {
              console.error('Critical error during user setup:', error);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            const [encryptionSuccess] = await Promise.allSettled([
              setupUserEncryption(session.user.id),
              fetchProfile(session.user.id)
            ]);
            
            if (encryptionSuccess.status === 'rejected') {
              console.warn('Encryption setup failed during session init, but user can still access the app');
            }
          } catch (error) {
            console.error('Critical error during session init:', error);
          }
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData,
      },
    });
    return { error };
  };

  const signOut = async () => {
    // Clear encryption keys on logout using secure method
    try {
      const { clearAllKeys } = await import('@/utils/encryption/SecureKeys');
      await clearAllKeys();
    } catch (error) {
      console.warn('Failed to clear secure keys:', error);
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    profile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
