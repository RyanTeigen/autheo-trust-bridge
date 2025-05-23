
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile data if session exists
        if (session?.user) {
          // Use setTimeout to prevent potential auth deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // First try to get the user from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.log('Profile not found in database, using metadata from auth');
        // Don't throw here, continue to use user metadata
      }

      // Get user metadata from auth.users
      const { data: userData } = await supabase.auth.getUser();
      
      const userMetadata = userData.user?.user_metadata;
      
      // Create a profile from either db profile or user metadata
      // Convert the single 'role' from the database to an array of roles for our app
      const rolesArray = profileData?.role 
        ? [profileData.role] 
        : (userMetadata?.roles || []);
        
      setProfile({
        id: userId,
        email: userData.user?.email || '',
        firstName: profileData?.first_name || userMetadata?.first_name || '',
        lastName: profileData?.last_name || userMetadata?.last_name || '',
        roles: rolesArray,
      });
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // If there's an error, we'll try to use just the user metadata
      if (user && user.user_metadata) {
        setProfile({
          id: userId,
          email: user.email || '',
          firstName: user.user_metadata.first_name || '',
          lastName: user.user_metadata.last_name || '',
          roles: user.user_metadata.roles || [],
        });
      } else {
        // Create a minimal profile to ensure the app doesn't crash
        setProfile({
          id: userId,
          email: user?.email || '',
          firstName: '',
          lastName: '',
          roles: []
        });
      }
    } finally {
      // Always finish loading state after profile attempt
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // For creator access - return true for role checks
  const hasRole = (role: string): boolean => {
    // Always return true to ensure admin/creator access
    // for the current implementation
    return true;
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    signOut,
    isAuthenticated: !!user,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
