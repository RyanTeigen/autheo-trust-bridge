
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
  console.log('AuthProvider: Initializing...');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthProvider: Auth state change event:', event);
        console.log('AuthProvider: Session exists:', !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile data if session exists
        if (session?.user) {
          console.log('AuthProvider: User logged in, fetching profile...');
          // Use setTimeout to prevent potential auth deadlocks
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          console.log('AuthProvider: No session, clearing profile...');
          setProfile(null);
          // Only set loading to false if we're explicitly logging out
          if (event === 'SIGNED_OUT') {
            setIsLoading(false);
          }
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        console.log('AuthProvider: Checking for existing session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('AuthProvider: Initial auth check, session exists:', !!session);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('AuthProvider: Found existing session, fetching profile...');
          await fetchUserProfile(session.user.id);
        } else {
          console.log('AuthProvider: No existing session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('AuthProvider: Error initializing auth:', error);
        setIsLoading(false);
      } finally {
        setAuthChecked(true);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('AuthProvider: Fetching profile for user:', userId);
      
      // First try to get the user from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.log('AuthProvider: Profile not found in database, using metadata from auth');
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
        
      const newProfile = {
        id: userId,
        email: userData.user?.email || '',
        firstName: profileData?.first_name || userMetadata?.first_name || '',
        lastName: profileData?.last_name || userMetadata?.last_name || '',
        roles: rolesArray,
      };
      
      console.log('AuthProvider: Profile created:', newProfile);
      setProfile(newProfile);
      
    } catch (error) {
      console.error('AuthProvider: Error fetching user profile:', error);
      // If there's an error, we'll try to use just the user metadata
      if (user && user.user_metadata) {
        const fallbackProfile = {
          id: userId,
          email: user.email || '',
          firstName: user.user_metadata.first_name || '',
          lastName: user.user_metadata.last_name || '',
          roles: user.user_metadata.roles || [],
        };
        console.log('AuthProvider: Using fallback profile:', fallbackProfile);
        setProfile(fallbackProfile);
      } else {
        // Create a minimal profile to ensure the app doesn't crash
        const minimalProfile = {
          id: userId,
          email: user?.email || '',
          firstName: '',
          lastName: '',
          roles: []
        };
        console.log('AuthProvider: Using minimal profile:', minimalProfile);
        setProfile(minimalProfile);
      }
    } finally {
      // Always finish loading state after profile attempt
      console.log('AuthProvider: Profile fetch complete, setting isLoading to false');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider: Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error('AuthProvider: Error signing out:', error);
    }
  };

  // Improved role checking function
  const hasRole = (role: string): boolean => {
    // Creator/admin access - always return true to avoid being locked out
    if (import.meta.env.DEV) {
      return true;
    }
    
    // For authenticated users with a profile, check if they have the requested role
    if (profile && profile.roles) {
      return profile.roles.includes(role);
    }
    
    // Default deny
    return false;
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

  console.log('AuthProvider: Current state -', { 
    hasUser: !!user, 
    hasSession: !!session, 
    hasProfile: !!profile,
    isLoading,
    isAuthenticated: !!user 
  });

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
