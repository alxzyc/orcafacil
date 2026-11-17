import React, { useState, useEffect, useRef } from 'react';
import { useProposals } from '../../hooks/useProposals';
import { GlassCard, Button, Badge, Dropdown, Modal, Avatar } from '../../components';
import { LoadingSpinner, SkeletonCard } from '../../components/LoadingSpinner';
import { toast } from 'sonner';
import { Search, FileText, Filter, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Copy, Eye, Download, MoreVertical, CheckCircle, XCircle, Clock, AlertCircle, Link as LinkIcon, RotateCcw } from 'lucide-react';
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      searchProposals(query, { page: 1, filters: statusFilter !== 'all' ? { status: statusFilter } : {} });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, statusFilter, searchProposals]);

  useEffect(() => {
    if (!debouncedQuery) {
      fetchProposals({ page: 1, filters: statusFilter !== 'all' ? { status: statusFilter } : {} });
    }
  }, [statusFilter, fetchProposals, debouncedQuery]);

  const handleDelete = async (id: string) => {
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
        return { icon: CheckCircle, color: 'text-[var(--success-text)]', bg: 'bg-[var(--success-bg)]', label: 'Aceita', variant: 'success' as const };
      case 'recusada':
        return { icon: XCircle, color: 'text-[var(--error-text)]', bg: 'bg-[var(--error-bg)]', label: 'Recusada', variant: 'error' as const };
      case 'enviada':
        return { icon: Clock, color: 'text-[var(--warning-text)]', bg: 'bg-[var(--warning-bg)]', label: 'Enviada', variant: 'warning' as const };
      case 'rascunho':
        return { icon: AlertCircle, color: 'text-[var(--info-text)]', bg: 'bg-[var(--info-bg)]', label: 'Rascunho', variant: 'info' as const };
      case 'expirada':
        return { icon: AlertCircle, color: 'text-[var(--warning-text)]', bg: 'bg-[var(--warning-bg)]', label: 'Expirada', variant: 'warning' as const };
      default:
        return { icon: AlertCircle, color: 'text-[var(--text-tertiary)]', bg: 'bg-[var(--bg-input)]', label: status, variant: 'neutral' as const };
    }
  };

  const getTotal = (proposal: Proposta) =>
    proposal.itens.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0);

  const dropdownItems = (proposal: Proposta) => [
    { label: 'Editar', icon: <Edit className="w-4 h-4" />, onClick: () => navigate(`/propostas/${proposal.id}`) },
    { label: 'Duplicar', icon: <Copy className="w-4 h-4" />, onClick: () => handleDuplicate(proposal.id) },
    { label: 'Copiar link público', icon: <LinkIcon className="w-4 h-4" />, onClick: () => handleCopyLink(proposal.id) },
    { label: 'Visualizar público', icon: <Eye className="w-4 h-4" />, onClick: () => navigate(`/p/${proposal.id}`) },
    { divider: true },
    { label: 'Excluir', icon: <Trash2 className="w-4 h-4" />, onClick: () => setDeletingId(proposal.id), danger: true },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-[var(--accent-lime)]" />
            Propostas
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Gerencie suas propostas comerciais</p>
        </div>
        <Link to="/propostas/nova">
          <Button variant="primary" className="flex items-center gap-2 whitespace-nowrap" leftIcon={<Plus className="w-5 h-5" />}>
            Nova Proposta
          </Button>
        </Link>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar por número, cliente..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-lime)] focus:ring-opacity-50 focus:border-transparent transition-all"
              aria-label="Buscar propostas"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" aria-hidden="true" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'all')}
              className="pl-10 pr-10 py-2 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-lime)] focus:ring-opacity-50 focus:border-transparent transition-all appearance-none"
              aria-label="Filtrar por status"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {error && (
        <GlassCard variant="bordered" className="p-4 border-[var(--error-border)]">
          <div className="flex items-center gap-3 text-[var(--error-text)]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Erro ao carregar propostas: {error.message}</p>
            <Button variant="ghost" size="sm" onClick={() => fetchProposals({ page: 1 })}>
              Tentar novamente
            </Button>
          </div>
        </GlassCard>
      )}

      <div className="space-y-3" role="list" aria-label="Lista de propostas">
        {isLoading && proposals.length === 0 ? (
          <div className="space-y-3" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : proposals.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <FileText className="w-16 h-16 mx-auto text-[var(--text-tertiary)] mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {debouncedQuery || statusFilter !== 'all' ? 'Nenhuma proposta encontrada' : 'Nenhuma proposta ainda'}
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {debouncedQuery || statusFilter !== 'all'
                ? 'Tente ajustar sua busca ou filtros'
                : 'Crie sua primeira proposta para começar'}
            </p>
            <Link to="/propostas/nova">
              <Button variant="primary" className="flex items-center gap-2 mx-auto" leftIcon={<Plus className="w-5 h-5" />}>
                Criar Proposta
              </Button>
            </Link>
          </GlassCard>
        ) : (
          proposals.map((proposal) => {
            const { icon: StatusIcon, variant, label } = getStatusConfig(proposal.status);
            const total = getTotal(proposal);

            return (
              <GlassCard
                key={proposal.id}
                variant="interactive"
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
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
                      {formatDate(proposal.created_at)} • {proposal.itens.length} item{proposal.itens.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 sm:ml-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-medium text-lg">{formatCurrency(total)}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Total</p>
                  </div>
                  <Dropdown
                    trigger={<MoreVertical className="w-5 h-5" />}
                    items={dropdownItems(proposal)}
                    align="right"
                  />
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2" role="navigation" aria-label="Paginação">
          <Button
            variant="secondary"
            size="sm"
            onClick={prevPage}
            disabled={currentPage <= 1 || isLoading}
            aria-label="Página anterior"
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Anterior
          </Button>
          <span className="px-4 text-[var(--text-secondary)]">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={nextPage}
            disabled={currentPage >= totalPages || isLoading}
            aria-label="Próxima página"
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Próxima
          </Button>
        </div>
      )}

      {totalCount !== null && totalCount > 0 && (
        <p className="text-center text-sm text-[var(--text-tertiary)]">
          {totalCount} proposta{totalCount !== 1 ? 's' : ''} no total
        </p>
      )}

      {deletingId && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingId(null)}
          title="Excluir proposta"
          description="Tem certeza que deseja excluir esta proposta? Esta ação não pode ser desfeita."
          size="sm"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancelar</Button>
              <Button variant="danger" onClick={() => handleDelete(deletingId!)} loading={true}>
                Excluindo...
              </Button>
            </div>
          }
        >
          <div />
        </Modal>
      )}
    </div>
  );
};

export default PropostasList;