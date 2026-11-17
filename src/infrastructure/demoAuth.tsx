import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

interface DemoAuthContextType {
  user: DemoUser | null;
  profile: DemoProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, companyName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (companyName: string) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

const DemoAuthContext = createContext<DemoAuthContextType | null>(null);

const DEMO_STORAGE_KEY = 'orcafacil_demo_data';

const getDemoData = () => {
  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { clients: [], proposals: [], catalog: [], profile: null };
  } catch {
    return { clients: [], proposals: [], catalog: [], profile: null };
  }
};

const setDemoData = (data: any) => {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
};

export const DemoAuthProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('orcafacil_demo_user');
    const storedProfile = localStorage.getItem('orcafacil_demo_profile');
    
    if (storedUser && storedProfile) {
      setUser(JSON.parse(storedUser));
      setProfile(JSON.parse(storedProfile));
    }
    setIsLoading(false);
  }, []);

  const signUp = async (email: string, password: string, companyName: string) => {
    setIsLoading(true);
    try {
      const demoUser: DemoUser = { id: crypto.randomUUID(), email };
      const demoProfile: DemoProfile = {
        id: crypto.randomUUID(),
        company_name: companyName,
        user_id: demoUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      localStorage.setItem('orcafacil_demo_user', JSON.stringify(demoUser));
      localStorage.setItem('orcafacil_demo_profile', JSON.stringify(demoProfile));
      
      setUser(demoUser);
      setProfile(demoProfile);
      
      const demoData = getDemoData();
      demoData.profile = demoProfile;
      setDemoData(demoData);
      
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
      let demoUser = JSON.parse(localStorage.getItem('orcafacil_demo_user') || 'null');
      let demoProfile = JSON.parse(localStorage.getItem('orcafacil_demo_profile') || 'null');
      
      if (!demoUser || demoUser.email !== email) {
        demoUser = { id: crypto.randomUUID(), email };
        demoProfile = {
          id: crypto.randomUUID(),
          company_name: email.split('@')[0],
          user_id: demoUser.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        localStorage.setItem('orcafacil_demo_user', JSON.stringify(demoUser));
        localStorage.setItem('orcafacil_demo_profile', JSON.stringify(demoProfile));
        
        const demoData = getDemoData();
        demoData.profile = demoProfile;
        setDemoData(demoData);
      }
      
      setUser(demoUser);
      setProfile(demoProfile);
      
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Sign in failed') };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    localStorage.removeItem('orcafacil_demo_user');
    localStorage.removeItem('orcafacil_demo_profile');
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    return { error: null };
  };

  const updateProfile = async (companyName: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    try {
      const updatedProfile = { ...profile!, company_name: companyName, updated_at: new Date().toISOString() };
      localStorage.setItem('orcafacil_demo_profile', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to update profile') };
    }
  };

  const refreshSession = async () => {};

  return (
    <DemoAuthContext.Provider
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
    </DemoAuthContext.Provider>
  );
};

export const useDemoAuth = (): DemoAuthContextType => {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
};