import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProposals } from '../../hooks/useProposals';
import { useClients } from '../../hooks/useClients';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { LoadingSpinner, LoadingOverlay } from '../../components/LoadingSpinner';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Proposta } from '../../types';

interface DashboardStats {
  totalClients: number;
  totalProposals: number;
  pendingProposals: number;
  acceptedValue: number;
  acceptanceRate: number;
}

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
      case 'aceita': return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Aceita' };
      case 'recusada': return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Recusada' };
      case 'enviada': return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Enviada' };
      case 'rascunho': return { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Rascunho' };
      default: return { icon: AlertCircle, color: 'text-white/60', bg: 'bg-white/10', label: status };
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F0E17] flex items-center justify-center">
        <LoadingOverlay message="Carregando dashboard..." />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Welcome Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Olá, {profile?.company_name || 'Usuário'}</h1>
            <p className="text-white/60 mt-1">
              Acompanhe suas propostas e clientes em um só lugar
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/propostas/nova')}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Proposta
          </Button>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
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

      {/* Acceptance Rate */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Taxa de Aceitação</h2>
          <span className="text-2xl font-bold text-green-400">{stats.acceptanceRate}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.acceptanceRate}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-white/60">
          {stats.totalProposals} propostas enviadas
        </p>
      </GlassCard>

      {/* Recent Proposals */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Propostas Recentes</h2>
        <Link to="/propostas" className="text-sm text-accent-lime hover:text-accent-lime/80 flex items-center gap-1">
          Ver todas <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </GlassCard>
          ))}
        </div>
      ) : recentProposals.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <FileText className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma proposta ainda</h3>
          <p className="text-white/60 mb-4">Crie sua primeira proposta para começar</p>
          <Button
            variant="primary"
            onClick={() => navigate('/propostas/nova')}
            className="flex items-center gap-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Criar Proposta
          </Button>
        </GlassCard>
      ) : (
        <div className="space-y-3" role="list" aria-label="Propostas recentes">
          {recentProposals.map((proposal) => {
            const { icon: StatusIcon, color, bg, label } = getStatusConfig(proposal.status);
            const total = proposal.itens.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0);

            return (
              <GlassCard key={proposal.id} className="p-4 flex items-center justify-between group">
                <Link to={`/propostas/${proposal.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/5">
                      <FileText className="w-5 h-5 text-white/70" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{proposal.numero}</p>
                      <p className="text-sm text-white/60 truncate">
                        {format(new Date(proposal.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-4 ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-medium">{formatCurrency(total)}</p>
                    <p className="text-xs text-white/50">Total</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${color} ${bg}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    {label}
                  </span>
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
          icon={TrendingUp}
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

// Stat Card Component
interface StatCardProps {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color: string;
  bg: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, color, bg }) => (
  <GlassCard className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-white/60">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon className={`w-6 h-6 ${color}`} aria-hidden="true" />
      </div>
    </div>
  </GlassCard>
);

// Quick Action Card Component
interface QuickActionCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
  color: string;
  bg: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  color,
  bg,
}) => (
  <GlassCard className="p-4 flex items-center gap-4 group cursor-pointer transition-all hover:bg-white/10" onClick={onClick}>
    <div className={`p-3 rounded-xl ${bg}`}>
      <Icon className={`w-6 h-6 ${color}`} aria-hidden="true" />
    </div>
    <div>
      <p className="font-medium group-hover:text-accent-lime transition-colors">{title}</p>
      <p className="text-sm text-white/60">{description}</p>
    </div>
  </GlassCard>
);





