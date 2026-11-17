import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProposals } from '../../hooks/useProposals';
import { useClients } from '../../hooks/useClients';
import { GlassCard, Button, Badge, Avatar } from '../../components';
import { LoadingSpinner, SkeletonCard } from '../../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  Activity,
  Target,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Proposta, DashboardStats } from '../../types';

export const Dashboard: React.FC = () => {
  const { profile, isLoading: authLoading } = useAuth();
  const { proposals, isLoading: proposalsLoading, fetchProposals } = useProposals();
  const { totalCount: clientsCount, isLoading: clientsLoading, fetchClients } = useClients();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalProposals: 0,
    pendingProposals: 0,
    acceptedValue: 0,
    acceptanceRate: 0,
  });
  const [recentProposals, setRecentProposals] = useState<Proposta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchProposals({ page: 1, pageSize: 5, column: 'created_at', ascending: false });
      fetchClients({ page: 1, pageSize: 1 });
    }
  }, [authLoading, fetchProposals, fetchClients]);

  useEffect(() => {
    if (!proposalsLoading && !clientsLoading) {
      calculateStats();
      setRecentProposals(proposals.slice(0, 5));
      setIsLoading(false);
    }
  }, [proposals, proposalsLoading, clientsLoading]);

  const calculateStats = () => {
    const total = proposals.length;
    const pending = proposals.filter(p => p.status === 'enviada' || p.status === 'rascunho').length;
    const accepted = proposals.filter(p => p.status === 'aceita');
    const acceptedValue = accepted.reduce((sum: number, p) =>
      sum + p.itens.reduce((s: number, i: { quantidade: number; valorUnitario: number }) => s + i.quantidade * i.valorUnitario, 0), 0);
    const acceptanceRate = total > 0 ? Math.round((accepted.length / total) * 100) : 0;

    setStats({
      totalClients: clientsCount || 0,
      totalProposals: total,
      pendingProposals: pending,
      acceptedValue,
      acceptanceRate,
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'aceita': return { icon: CheckCircle, color: 'text-[var(--success-text)]', bg: 'bg-[var(--success-bg)]', label: 'Aceita', variant: 'success' as const };
      case 'recusada': return { icon: XCircle, color: 'text-[var(--error-text)]', bg: 'bg-[var(--error-bg)]', label: 'Recusada', variant: 'error' as const };
      case 'enviada': return { icon: Clock, color: 'text-[var(--warning-text)]', bg: 'bg-[var(--warning-bg)]', label: 'Enviada', variant: 'warning' as const };
      case 'rascunho': return { icon: AlertCircle, color: 'text-[var(--info-text)]', bg: 'bg-[var(--info-bg)]', label: 'Rascunho', variant: 'info' as const };
      default: return { icon: AlertCircle, color: 'text-[var(--text-tertiary)]', bg: 'bg-[var(--bg-input)]', label: status, variant: 'neutral' as const };
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <LoadingOverlay message="Carregando dashboard..." />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, value, label, color, bg, trend }: {
    icon: React.ElementType;
    value: number | string;
    label: string;
    color: string;
    bg: string;
    trend?: { value: number; label: string; positive: boolean };
  }) => (
    <GlassCard className="p-5 hover-lift">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
          <p className="text-3xl font-bold mt-1 tabular-nums">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-xs font-medium ${trend.positive ? 'text-[var(--success-text)]' : 'text-[var(--error-text)]'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}%
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} aria-hidden="true" />
        </div>
      </div>
    </GlassCard>
  );

  const QuickActionCard = ({ icon: Icon, title, description, onClick, color, bg }: {
    icon: React.ElementType;
    title: string;
    description: string;
    onClick: () => void;
    color: string;
    bg: string;
  }) => (
    <GlassCard variant="interactive" className="p-5 flex items-center gap-4" onClick={onClick}>
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} aria-hidden="true" />
      </div>
      <div>
        <p className="font-medium group-hover:text-[var(--accent-lime)] transition-colors">{title}</p>
        <p className="text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
    </GlassCard>
  );

  return (
    <div className="p-4 space-y-6 pb-28">
      {/* Welcome Header */}
      <GlassCard variant="accent" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Olá, {profile?.company_name || 'Usuário'}</h1>
            <p className="text-[var(--text-secondary)] mt-1">
              Acompanhe suas propostas e clientes em um só lugar
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/propostas/nova')}
            className="flex items-center gap-2"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Nova Proposta
          </Button>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          value={stats.totalClients}
          label="Clientes"
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <StatCard
          icon={FileText}
          value={stats.totalProposals}
          label="Total Propostas"
          color="text-purple-400"
          bg="bg-purple-500/10"
        />
        <StatCard
          icon={Clock}
          value={stats.pendingProposals}
          label="Pendentes"
          color="text-yellow-400"
          bg="bg-yellow-500/10"
        />
        <StatCard
          icon={DollarSign}
          value={formatCurrency(stats.acceptedValue)}
          label="Valor Aceito"
          color="text-green-400"
          bg="bg-green-500/10"
        />
      </div>

      {/* Acceptance Rate & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Taxa de Aceitação</h2>
            <span className="text-2xl font-bold text-[var(--success-text)]">{stats.acceptanceRate}%</span>
          </div>
          <div className="w-full bg-[var(--bg-input)] rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[var(--success)] to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${stats.acceptanceRate}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {stats.totalProposals} propostas enviadas
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Atividade Recente</h2>
            <Badge variant="accent" dot>Ativo</Badge>
          </div>
          <div className="space-y-3">
            {recentProposals.slice(0, 3).map((proposal) => {
              const { icon: StatusIcon, variant, label } = getStatusConfig(proposal.status);
              return (
                <div key={proposal.id} className="flex items-center justify-between p-3 bg-[var(--bg-input)] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--bg-card)]">
                      <FileText className="w-5 h-5 text-[var(--text-secondary)]" />
                    </div>
                    <div>
                      <p className="font-medium truncate max-w-[200px]">{proposal.numero}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={variant} icon={<StatusIcon className="w-3 h-3" />}>
                    {label}
                  </Badge>
                </div>
              );
            })}
            {recentProposals.length === 0 && (
              <div className="text-center py-6 text-[var(--text-tertiary)]">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Recent Proposals */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Propostas Recentes</h2>
        <Link to="/propostas" className="text-sm text-[var(--text-link)] hover:text-[var(--text-link-hover)] flex items-center gap-1">
          Ver todas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : recentProposals.length === 0 ? (
        <GlassCard className="p-10 text-center">
          <FileText className="w-16 h-16 mx-auto text-[var(--text-tertiary)] mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma proposta ainda</h3>
          <p className="text-[var(--text-secondary)] mb-6">Crie sua primeira proposta para começar</p>
          <Button
            variant="primary"
            onClick={() => navigate('/propostas/nova')}
            className="flex items-center gap-2 mx-auto"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Criar Proposta
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-3" role="list" aria-label="Propostas recentes">
          {recentProposals.map((proposal) => {
            const { icon: StatusIcon, variant, label } = getStatusConfig(proposal.status);
            const total = proposal.itens.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0);

            return (
              <GlassCard key={proposal.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group card-interactive">
                <Link to={`/propostas/${proposal.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[var(--bg-input)]">
                    <FileText className="w-5 h-5 text-[var(--text-secondary)]" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{proposal.numero}</p>
                      <Badge variant={variant} icon={<StatusIcon className="w-3 h-3" />}>
                        {label}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] truncate mt-1">
                      {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })} • {proposal.itens.length} item{proposal.itens.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-4 sm:ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-medium">{formatCurrency(total)}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Total</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickActionCard
          icon={Users}
          title="Clientes"
          description="Gerenciar clientes"
          onClick={() => navigate('/clientes')}
          color="text-blue-400"
          bg="bg-blue-500/10"
        />
        <QuickActionCard
          icon={FileText}
          title="Propostas"
          description="Ver todas as propostas"
          onClick={() => navigate('/propostas')}
          color="text-purple-400"
          bg="bg-purple-500/10"
        />
        <QuickActionCard
          icon={DollarSign}
          title="Calculadora"
          description="Calcular preços"
          onClick={() => navigate('/calcular')}
          color="text-green-400"
          bg="bg-green-500/10"
        />
        <QuickActionCard
          icon={Target}
          title="Catálogo"
          description="Serviços e materiais"
          onClick={() => navigate('/catalogo')}
          color="text-orange-400"
          bg="bg-orange-500/10"
        />
      </div>
    </div>
  );
};

// Loading overlay for auth loading
const LoadingOverlay: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <div className="fixed inset-0 bg-[var(--bg-overlay)] backdrop-blur-sm flex flex-col items-center justify-center z-[var(--z-modal)]">
    <LoadingSpinner size="lg" color="accent" />
    <p className="mt-4 text-[var(--text-secondary)]">{message}</p>
  </div>
);

export default Dashboard;