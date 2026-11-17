import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, getCurrentUser, getCurrentSession, isAuthenticated } from '../infrastructure/supabaseClient';
import { profileService } from '../services';
import type { User } from '@supabase/supabase-js';
import { useDemoAuth } from '../infrastructure/demoAuth';

// Demo types
interface DemoUser {
  id: string;
  email: string;
}

interface DemoProfile {
  id: string;
  company_name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Common user profile types (union for both real and demo)
interface CommonUser {
  id: string;
  email?: string;
}

interface CommonProfile {
  id: string;
  company_name?: string;
}

// Auth context type - supports both real Supabase and demo auth
interface AuthContextType {
  user: CommonUser | null;
  profile: CommonProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, companyName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (companyName: string) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Check if Supabase is configured
const hasSupabaseConfig = !!import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== 'https://your-project-ref.supabase.co';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use demo auth when Supabase not configured, otherwise real auth
  const { user: demoUser, profile: demoProfile, isLoading: demoLoading, signUp: demoSignUp, signIn: demoSignIn, signOut: demoSignOut } = useDemoAuth();

  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<CommonUser | null>(null);
  const [profile, setProfile] = useState<CommonProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useRealAuth, setUseRealAuth] = useState<boolean | null>(null);

  useEffect(() => {
    if (hasSupabaseConfig) {
      // Initialize real Supabase auth
      initRealAuth();
    } else {
      // Use demo auth
      setUseRealAuth(false);
      setUser(demoUser as CommonUser | null);
      setProfile(demoProfile as CommonProfile | null);
      setIsLoading(demoLoading);
      setIsInitialized(true);
    }
  }, [hasSupabaseConfig, demoUser, demoProfile, demoLoading]);

  const initRealAuth = async () => {
    try {
      setIsLoading(true);
      
      // Check session first
      const session = await getCurrentSession();
      const currentUser = session?.user;
      
      if (currentUser) {
        // Map Supabase user to common type
        setUser({
          id: currentUser.id,
          email: currentUser.email,
        });
      }
      
      // Fetch profile
      if (currentUser && profileService) {
        const profileResult = await profileService.getByUserId(currentUser.id);
        if (profileResult.success && profileResult.data) {
          // Map profile to common type
          setProfile({
            id: profileResult.data.id,
            company_name: profileResult.data.company_name,
          });
        }
      }
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const user = session?.user;
          if (user) {
            setUser({
              id: user.id,
              email: user.email,
            });
            if (profileService) {
              const profileResult = await profileService.getByUserId(user.id);
              if (profileResult.success && profileResult.data) {
                setProfile({
                  id: profileResult.data.id,
                  company_name: profileResult.data.company_name,
                });
              }
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      });
      
      setIsInitialized(true);
      setIsLoading(false);
      
      // Cleanup on unmount
      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('Auth initialization error:', err);
      // Fallback to demo auth if Supabase fails
      setUseRealAuth(false);
      setUser(demoUser as CommonUser | null);
      setProfile(demoProfile as CommonProfile | null);
      setIsLoading(demoLoading);
      setIsInitialized(true);
    }
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    signUp: async (email: string, password: string, companyName: string) => {
      if (hasSupabaseConfig && profileService) {
        try {
          if (!user) return { error: new Error('Not authenticated') };
          const result = await profileService.createForUser(user.id, companyName);
          return { error: result.error };
        } catch (err) {
          return { error: err instanceof Error ? err : new Error('Sign up failed') };
        }
      }
      return await demoSignUp(email, password, companyName);
    },
    signIn: async (email: string, password: string) => {
      if (hasSupabaseConfig) {
        try {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) return { error };
          // Update user and profile after sign in
          const session = await getCurrentSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
            });
          }
          return { error: null };
        } catch (err) {
          return { error: err instanceof Error ? err : new Error('Sign in failed') };
        }
      }
      return await demoSignIn(email, password);
    },
    signOut: async () => {
      if (hasSupabaseConfig) {
        await supabase.auth.signOut();
      }
      await demoSignOut();
    },
    resetPassword: async (email: string) => {
      if (hasSupabaseConfig) {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          return { error };
        } catch (err) {
          return { error: err instanceof Error ? err : new Error('Password reset failed') };
        }
      }
      return { error: null };
    },
    updateProfile: async (companyName: string) => {
      if (hasSupabaseConfig && profileService) {
        if (!user) return { error: new Error('Not authenticated') };
        try {
          const result = await profileService.updateCompanyName(user.id, companyName);
          if (result.success && result.data) {
            setProfile({
              id: result.data.id,
              company_name: result.data.company_name,
            });
          }
          return { error: result.error };
        } catch (err) {
          return { error: err instanceof Error ? err : new Error('Failed to update profile') };
        }
      }
// Demo: just update localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      if (demoData.profile) {
        demoData.profile.company_name = companyName;
        demoData.profile.updated_at = new Date().toISOString();
        localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
        setProfile({
          id: demoData.profile.id,
          company_name: demoData.profile.company_name,
        });
      }
      return { error: null };
    },
    refreshSession: async () => {
      if (hasSupabaseConfig) {
        try {
          const session = await getCurrentSession();
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email,
            });
          }
        } catch (err) {
          // ignore
        }
      } else {
        // Demo: no-op
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};