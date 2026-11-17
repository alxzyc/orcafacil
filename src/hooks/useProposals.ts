import { useState, useCallback } from 'react';
import { proposalService, type ListResult, type QueryOptions, type ServiceResult } from '../services';
import type { Proposta, ProposalStatus, CreateProposalInput, UpdateProposalInput } from '@/types';
import { useAuth } from './useAuth';
import { useDemoAuth } from '../infrastructure/demoAuth';

interface UseProposalsReturn {
  // Data
  proposals: Proposta[];
  isLoading: boolean;
  error: Error | null;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number | null;
  // Actions
  fetchProposals: (options?: QueryOptions) => Promise<void>;
  createProposal: (proposal: CreateProposalInput) => Promise<ServiceResult<Proposta>>;
  updateProposal: (id: string, updates: UpdateProposalInput) => Promise<ServiceResult<Proposta>>;
  deleteProposal: (id: string) => Promise<ServiceResult<void>>;
  duplicateProposal: (id: string) => Promise<ServiceResult<Proposta>>;
  updateStatus: (id: string, status: ProposalStatus) => Promise<ServiceResult<Proposta>>;
  searchProposals: (query: string, options?: QueryOptions) => Promise<void>;
  refresh: () => Promise<void>;
  // Pagination helpers
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export const useProposals = (): UseProposalsReturn => {
  const { profile, isAuthenticated } = useAuth();
  const { signOut: demoSignOut } = useDemoAuth();
  const [proposals, setProposals] = useState<Proposta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
  const [lastOptions, setLastOptions] = useState<QueryOptions>({});

  const fetchProposals = useCallback(async (options: QueryOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        // Demo mode - return empty state
        setProposals([]);
        setTotalCount(0);
        setTotalPages(0);
        setCurrentPage(1);
        return;
      }

      if (!profile) {
        await fetchProposals({ page: 1, pageSize: 20 });
        return;
      }

      let result: ListResult<Proposta>;

      if (lastSearchQuery.trim()) {
        result = await proposalService.searchForProfile(profile.id, lastSearchQuery, {
          ...lastOptions,
          ...options,
          page: options.page || 1,
        });
      } else {
        result = await proposalService.listForProfile(profile.id, {
          ...lastOptions,
          ...options,
          page: options.page || 1,
        });
      }

      if (result.success) {
        setProposals(result.data || []);
        setTotalCount(result.count);
        setTotalPages(result.totalPages);
        setCurrentPage(result.page);
      } else {
        setError(new Error(result.error?.message || 'Failed to fetch proposals'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [profile, isAuthenticated, lastSearchQuery, lastOptions]);

  const searchProposals = useCallback(async (query: string, options: QueryOptions = {}) => {
    setLastSearchQuery(query);
    setLastOptions(options);
    await fetchProposals({ ...options, page: 1 });
  }, [fetchProposals]);

  const createProposal = useCallback(async (proposal: CreateProposalInput) => {
    if (!isAuthenticated) {
      // Demo mode - create in localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      const newProposta: Proposta = {
        id: crypto.randomUUID(),
        profile_id: crypto.randomUUID(),
        clienteId: proposal.clienteId,
        numero: `ORC-2024-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        itens: proposal.itens || [],
        desconto: proposal.desconto ?? 0,
        validade: proposal.validade || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: proposal.status || 'rascunho',
        public_token: crypto.randomUUID().substring(0, 8),
        public_token_enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoData.proposals = demoData.proposals || [];
      demoData.proposals.push(newProposta);
      localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
      setProposals([...demoData.proposas, newProposta]);
      setTotalCount((demoData.totalCount || 0) + 1);
      return { data: newProposta, error: null, success: true };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await proposalService.createWithItems(profile.id, proposal);
    if (result.success) {
      await fetchProposals(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated]);

  const updateProposal = useCallback(async (id: string, updates: UpdateProposalInput) => {
    if (!isAuthenticated) {
      // Demo mode - update in localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      const propostaIndex = demoData.proposals?.findIndex((p: any) => p.id === id);
      if (propostaIndex >= 0) {
        const updated = { ...demoData.proposas[propostaIndex], ...updates, updated_at: new Date().toISOString() };
        demoData.proposals[propostaIndex] = updated;
        localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
        setProposals([...demoData.proposas]);
      }
      return { data: demoData.proposas[propostaIndex], error: null, success: true };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await proposalService.updateWithItems(profile.id, id, updates);
    if (result.success) {
      await fetchProposals(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated]);

  const deleteProposal = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      // Demo mode - remove from localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      demoData.proposals = demoData.proposals?.filter((p: any) => p.id !== id) || [];
      localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
      setProposals([...demoData.proposas]);
      setTotalCount(demoData.totalCount != null ? demoData.totalCount - 1 : 0);
      return { data: null, error: null, success: true };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await proposalService.deleteForProfile(profile.id, id);
    if (result.success) {
      await fetchProposals(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated]);

  const duplicateProposal = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      // Demo mode - duplicate in localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      const original = demoData.proposas?.find((p: any) => p.id === id);
      if (original) {
        const duplicated: CreateProposalInput = {
          clienteId: original.clienteId,
          itens: original.itens.map((item: any) => ({ ...item, id: crypto.randomUUID() })),
          desconto: original.desconto,
          validade: original.validade,
          condicoes: original.condicoes,
          status: 'rascunho' as ProposalStatus,
        };
        const result = await createProposal(duplicated);
        return result;
      }
      return { data: null, error: new Error('Proposal not found'), success: false };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await proposalService.duplicateForProfile(profile.id, id);
    if (result.success) {
      await fetchProposals(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated, createProposal]);

  const updateStatus = useCallback(async (id: string, status: ProposalStatus) => {
    if (!isAuthenticated) {
      // Demo mode - update status in localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      const propostaIndex = demoData.proposals?.findIndex((p: any) => p.id === id);
      if (propostaIndex >= 0) {
        demoData.proposas[propostaIndex].status = status;
        localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
        setProposals([...demoData.proposas]);
      }
      return { data: demoData.proposas[propostaIndex], error: null, success: true };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await proposalService.updateStatus(profile.id, id, status);
    if (result.success) {
      await fetchProposals(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated]);

  const refresh = useCallback(async () => {
    await fetchProposals({ page: currentPage });
  }, [fetchProposals, currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchProposals({ page });
    }
  }, [fetchProposals, totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchProposals({ page: currentPage + 1 });
    }
  }, [fetchProposals, currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchProposals({ page: currentPage - 1 });
    }
  }, [fetchProposals, currentPage]);

  return {
    proposals,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    fetchProposals,
    createProposal,
    updateProposal,
    deleteProposal,
    duplicateProposal,
    updateStatus,
    searchProposals,
    refresh,
    goToPage,
    nextPage,
    prevPage,
  };
};