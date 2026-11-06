import '@testing-library/jest-dom';
import { vi, beforeAll, afterAll } from 'vitest';
import React from 'react';

// Mock Supabase
vi.mock('../infrastructure/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
  getCurrentUser: vi.fn(),
  getCurrentSession: vi.fn(),
  isAuthenticated: vi.fn(),
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/' }),
    useParams: () => ({}),
    Link: ({ children, to, ...props }: any) =>
      React.createElement('a', { href: to, ...props }, children),
  };
});

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () => null,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const icons = [
    'Plus', 'Search', 'Edit', 'Trash2', 'User', 'Mail', 'Phone', 'X', 'Check',
    'Loader2', 'ChevronLeft', 'ChevronRight', 'AlertCircle', 'Clock', 'CheckCircle',
    'XCircle', 'MoreVertical', 'Download', 'Eye', 'Copy', 'Save', 'ArrowLeft',
    'ArrowRight', 'FileText', 'Package', 'Calendar', 'CreditCard', 'Share2',
    'TrendingUp', 'DollarSign', 'Percent', 'RotateCcw', 'Building', 'Lock',
    'Check', 'Filter', 'Link', 'Copy', 'Menu', 'X', 'AlertCircle', 'CheckCircle',
    'XCircle', 'Clock', 'ArrowRight', 'MoreVertical', 'Plus', 'Search', 'Edit',
    'Trash2', 'User', 'Mail', 'Phone', 'X', 'Check', 'Loader2', 'ChevronLeft',
    'ChevronRight', 'AlertCircle', 'Clock', 'CheckCircle', 'XCircle', 'MoreVertical',
    'Download', 'Eye', 'Copy', 'Save', 'ArrowLeft', 'ArrowRight', 'FileText',
    'Package', 'Calendar', 'CreditCard', 'Share2', 'TrendingUp', 'DollarSign',
    'Percent', 'RotateCcw', 'Building', 'Lock', 'Check'
  ];

  const mockIcons = icons.reduce((acc, icon) => {
    acc[icon] = ({ ...props }: any) =>
      React.createElement('svg', { ...props, 'data-testid': `icon-${icon.toLowerCase()}` });
    return acc;
  }, {} as Record<string, React.FC>);

  return mockIcons;
});

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Suppress console errors in tests unless explicitly testing them
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
      args[0]?.includes?.('act(...)')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});



