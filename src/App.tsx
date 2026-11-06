import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Toaster } from 'sonner';
import { GlassCard } from './components/GlassCard';
import { Button } from './components/Button';
import { BottomNav } from './components/BottomNav';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy load feature components
const ClientesList = lazy(() => import('./features/clientes/ClientesList').then(m => ({ default: m.ClientesList })));
const Calculadora = lazy(() => import('./features/precificacao/Calculadora').then(m => ({ default: m.Calculadora })));
const PropostasList = lazy(() => import('./features/propostas/PropostasList').then(m => ({ default: m.PropostasList })));
const ProposalForm = lazy(() => import('./features/propostas/ProposalForm').then(m => ({ default: m.ProposalForm })));
const PublicProposal = lazy(() => import('./features/propostas/PublicProposal').then(m => ({ default: m.PublicProposal })));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const Login = lazy(() => import('./features/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./features/auth/Register').then(m => ({ default: m.Register })));

// Loading fallback for lazy components
const LazyFallback = () => (
  <div className="min-h-screen bg-[#0F0E17] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LazyFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public route wrapper (redirects authenticated users)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LazyFallback />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main app layout with bottom nav
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#0F0E17] text-white">
    {children}
    <BottomNav />
  </div>
);

// Auth layout (no bottom nav)
const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#0F0E17] text-white flex items-center justify-center p-4">
    {children}
  </div>
);

// Public proposal layout (no bottom nav, light theme)
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-white text-black">
    {children}
  </div>
);

// Home/Dashboard page
const Home = () => (
  <AppLayout>
    <Suspense fallback={<LazyFallback />}>
      <Dashboard />
    </Suspense>
  </AppLayout>
);

// Clients page
const ClientsPage = () => (
  <AppLayout>
    <Suspense fallback={<LazyFallback />}>
      <ClientesList />
    </Suspense>
  </AppLayout>
);

// Calculator page
const CalculatorPage = () => (
  <AppLayout>
    <Suspense fallback={<LazyFallback />}>
      <Calculadora />
    </Suspense>
  </AppLayout>
);

// Proposals list page
const ProposalsPage = () => (
  <AppLayout>
    <Suspense fallback={<LazyFallback />}>
      <PropostasList />
    </Suspense>
  </AppLayout>
);

// New proposal page
const NewProposalPage = () => (
  <AppLayout>
    <Suspense fallback={<LazyFallback />}>
      <ProposalForm />
    </Suspense>
  </AppLayout>
);

// Login page
const LoginPage = () => (
  <AuthLayout>
    <Suspense fallback={<LazyFallback />}>
      <Login />
    </Suspense>
  </AuthLayout>
);

// Register page
const RegisterPage = () => (
  <AuthLayout>
    <Suspense fallback={<LazyFallback />}>
      <Register />
    </Suspense>
  </AuthLayout>
);

// Public proposal page
const PublicProposalPage = () => (
  <PublicLayout>
    <Suspense fallback={<LazyFallback />}>
      <PublicProposal />
    </Suspense>
  </PublicLayout>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      <Route path="/p/:token" element={<PublicProposalPage />} />

      {/* Protected routes */}
      <Route element={
        <ProtectedRoute>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/calcular" element={<CalculatorPage />} />
              <Route path="/propostas" element={<ProposalsPage />} />
              <Route path="/propostas/nova" element={<NewProposalPage />} />
              <Route path="/propostas/:id" element={<NewProposalPage />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all redirects to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'bg-[#1F1C2B] border border-white/10 text-white',
            style: { background: 'var(--bg-card)', border: '1px solid var(--glass-border)' },
            duration: 4000,
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}



