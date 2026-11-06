import React, { useState, useEffect, useRef } from 'react';
import { useProposals } from '../../hooks/useProposals';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { toast } from 'sonner';
import { Search, FileText, Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Copy, Eye, Download, MoreVertical, CheckCircle, XCircle, Clock, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Proposta, ProposalStatus } from '../../types';

const statusOptions: { value: ProposalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'enviada', label: 'Enviada' },
  { value: 'aceita', label: 'Aceita' },
  { value: 'recusada', label: 'Recusada' },
  { value: 'expirada', label: 'Expirada' },
];

export const PropostasList: React.FC = () => {
  const {
    proposals,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    fetchProposals,
    deleteProposal,
    duplicateProposal,
    updateStatus,
    searchProposals,
    goToPage,
    nextPage,
    prevPage,
  } = useProposals();

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      searchProposals(query, { page: 1, filters: statusFilter !== 'all' ? { status: statusFilter } : {} });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, statusFilter, searchProposals]);

  // Fetch when status filter changes
  useEffect(() => {
    if (!debouncedQuery) {
      fetchProposals({ page: 1, filters: statusFilter !== 'all' ? { status: statusFilter } : {} });
    }
  }, [statusFilter, fetchProposals, debouncedQuery]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) return;

    setDeletingId(id);
    try {
      const result = await deleteProposal(id);
      if (result.success) {
        toast.success('Proposta excluída!');
      } else {
        toast.error(result.error?.message || 'Erro ao excluir');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const result = await duplicateProposal(id);
      if (result.success) {
        toast.success('Proposta duplicada!');
      } else {
        toast.error(result.error?.message || 'Erro ao duplicar');
      }
    } catch (error) {
      toast.error('Erro ao duplicar proposta');
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/p/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Link copiado!');
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) =>
    format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });

  const getStatusConfig = (status: ProposalStatus) => {
    switch (status) {
      case 'aceita':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Aceita' };
      case 'recusada':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Recusada' };
      case 'enviada':
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Enviada' };
      case 'rascunho':
        return { icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Rascunho' };
      case 'expirada':
        return { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Expirada' };
      default:
        return { icon: AlertCircle, color: 'text-white/60', bg: 'bg-white/10', label: status };
    }
  };

  const getTotal = (proposal: Proposta) =>
    proposal.itens.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent-lime" />
            Propostas
          </h1>
          <p className="text-white/60 text-sm mt-1">Gerencie suas propostas comerciais</p>
        </div>
        <Link to="/propostas/nova">
          <Button variant="primary" className="flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-5 h-5" />
            Nova Proposta
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar por número, cliente..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all"
              aria-label="Buscar propostas"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" aria-hidden="true" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'all')}
              className="pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all appearance-none"
              aria-label="Filtrar por status"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Error State */}
      {error && (
        <GlassCard className="p-4 border-red-500/20">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Erro ao carregar propostas: {error.message}</p>
            <Button variant="ghost" size="sm" onClick={() => fetchProposals({ page: 1 })}>
              Tentar novamente
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Proposal List */}
      <div className="space-y-3" role="list" aria-label="Lista de propostas">
        {isLoading && proposals.length === 0 ? (
          <div className="space-y-3" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10" />
                    <div className="space-y-2">
                      <div className="h-4 bg-white/10 rounded w-1/4" />
                      <div className="h-3 bg-white/5 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="h-8 w-20 rounded bg-white/10" />
                </div>
              </GlassCard>
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <FileText className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {debouncedQuery || statusFilter !== 'all' ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta ainda'}
            </h3>
            <p className="text-white/60 mb-4">
              {debouncedQuery || statusFilter !== 'all'
                ? 'Tente ajustar sua busca ou filtros'
                : 'Crie sua primeira proposta para começar'}
            </p>
            <Link to="/propostas/nova">
              <Button variant="primary" className="flex items-center gap-2 mx-auto">
                <Plus className="w-5 h-5" />
                Criar Proposta
              </Button>
            </Link>
          </GlassCard>
        ) : (
          proposals.map((proposal) => {
            const { icon: StatusIcon, color, bg, label } = getStatusConfig(proposal.status);
            const total = getTotal(proposal);

            return (
              <GlassCard
                key={proposal.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
              >
                <Link to={`/propostas/${proposal.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 flex-shrink-0">
                    <FileText className="w-5 h-5 text-white/70" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{proposal.numero}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color} ${bg} flex items-center gap-1`}>
                        <StatusIcon className="w-3 h-3" aria-hidden="true" />
                        {label}
                      </span>
                    </div>
                    <p className="text-sm text-white/60 truncate mt-1">
                      {formatDate(proposal.created_at)} • {proposal.itens.length} item{proposal.itens.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 sm:ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-medium text-lg">{formatCurrency(total)}</p>
                    <p className="text-xs text-white/50">Total</p>
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="p-2" aria-label="Mais opções">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                    <DropdownMenu
                      items={[
                        { label: 'Editar', icon: Edit, onClick: () => navigate(`/propostas/${proposal.id}`) },
                        { label: 'Duplicar', icon: Copy, onClick: () => handleDuplicate(proposal.id) },
                        { label: 'Copiar link público', icon: LinkIcon, onClick: () => handleCopyLink(proposal.id) },
                        { label: 'Visualizar público', icon: Eye, onClick: () => navigate(`/p/${proposal.id}`) },
                        { type: 'divider' },
                        { label: 'Excluir', icon: Trash2, onClick: () => handleDelete(proposal.id), danger: true },
                      ]}
                    />
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2" role="navigation" aria-label="Paginação">
          <Button
            variant="secondary"
            size="sm"
            onClick={prevPage}
            disabled={currentPage <= 1 || isLoading}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-4 text-white/70">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={nextPage}
            disabled={currentPage >= totalPages || isLoading}
            aria-label="Próxima página"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Total count */}
      {totalCount !== null && totalCount > 0 && (
        <p className="text-center text-sm text-white/50">
          {totalCount} proposta{totalCount !== 1 ? 's' : ''} no total
        </p>
      )}
    </div>
  );
};

// Dropdown Menu Component
interface DropdownMenuProps {
  items: Array<{
    type?: 'divider';
    label?: string;
    icon?: React.ElementType;
    onClick?: () => void;
    danger?: boolean;
  }>;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-1 z-50 min-w-[180px] bg-[#1F1C2B] border border-white/10 rounded-xl shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
          role="menu"
        >
          {items.map((item, index) => {
            if (item.type === 'divider') {
              return <div key={index} className="border-t border-white/10 my-1" role="separator" />;
            }
            return (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left flex items-center gap-2 text-sm transition-colors ${item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-white/80 hover:bg-white/5'}`}
                role="menuitem"
              >
                {item.icon && <item.icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Mais opções"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
    </div>
  );
};





