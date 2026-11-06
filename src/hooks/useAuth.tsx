import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, getCurrentUser, getCurrentSession, isAuthenticated } from '../infrastructure/supabaseClient';
import { profileService } from '../services';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  company_name: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const session = await getCurrentSession();
        if (session?.user) {
          setUser(session.user);
          // Fetch profile
          const profileResult = await profileService.getByUserId(session.user.id);
          if (profileResult.success && profileResult.data) {
            setProfile(profileResult.data);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        // Fetch profile on sign in
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const profileResult = await profileService.getByUserId(session.user.id);
          if (profileResult.success && profileResult.data) {
            setProfile(profileResult.data);
          }
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, companyName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            company_name: companyName,
          },
        },
      });

      if (error) {
        return { error };
      }

      // Profile will be created by trigger or manually
      if (data.user) {
        const profileResult = await profileService.createForUser(data.user.id, companyName);
        if (!profileResult.success) {
          console.error('Profile creation failed:', profileResult.error);
        } else if (profileResult.data) {
          setProfile(profileResult.data);
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Sign up failed') };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Sign in failed') };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Password reset failed') };
    }
  };

  const updateProfile = async (companyName: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const result = await profileService.updateCompanyName(user.id, companyName);
      if (result.success && result.data) {
        setProfile(result.data);
        return { error: null };
      }
      return { error: result.error || new Error('Failed to update profile') };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to update profile') };
    }
  };

  const refreshSession = async () => {
    const session = await getCurrentSession();
    if (session?.user) {
      setUser(session.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        refreshSession,
      }}
    >
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



