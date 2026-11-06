import { useState, useCallback } from 'react';
import { proposalService, type ListResult, type QueryOptions, type ServiceResult } from '../services';
import type { Proposta, ProposalStatus } from '@/types';
import { useAuth } from './useAuth';

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
  createProposal: (proposal: Omit<Proposta, 'id' | 'numero' | 'created_at' | 'updated_at'>) => Promise<ServiceResult<Proposta>>;
  updateProposal: (id: string, updates: Partial<Proposta>) => Promise<ServiceResult<Proposta>>;
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
  const { profile } = useAuth();
  const [proposals, setProposals] = useState<Proposta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
  const [lastOptions, setLastOptions] = useState<QueryOptions>({});

  const fetchProposals = useCallback(async (options: QueryOptions = {}) => {
    if (!profile) return;

    setIsLoading(true);
    setError(null);

    try {
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
  }, [profile, lastSearchQuery, lastOptions]);

  const searchProposals = useCallback(async (query: string, options: QueryOptions = {}) => {
    setLastSearchQuery(query);
    setLastOptions(options);
    await fetchProposals({ ...options, page: 1 });
  }, [fetchProposals]);

  const createProposal = useCallback(async (proposal: Omit<Proposta, 'id' | 'numero' | 'created_at' | 'updated_at'>) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await proposalService.createWithItems(profile.id, proposal);
    if (result.success) {
      await fetchProposals(); // Refresh list
    }
    return result;
  }, [profile, fetchProposals]);

  const updateProposal = useCallback(async (id: string, updates: Partial<Proposta>) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await proposalService.updateWithItems(profile.id, id, updates);
    if (result.success) {
      await fetchProposals(); // Refresh list
    }
    return result;
  }, [profile, fetchProposals]);

  const deleteProposal = useCallback(async (id: string) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await proposalService.deleteForProfile(profile.id, id);
    if (result.success) {
      await fetchProposals(); // Refresh list
    }
    return result;
  }, [profile, fetchProposals]);

  const duplicateProposal = useCallback(async (id: string) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await proposalService.duplicateForProfile(profile.id, id);
    if (result.success) {
      await fetchProposals(); // Refresh list
    }
    return result;
  }, [profile, fetchProposals]);

  const updateStatus = useCallback(async (id: string, status: ProposalStatus) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await proposalService.updateStatus(profile.id, id, status);
    if (result.success) {
      await fetchProposals(); // Refresh list
    }
    return result;
  }, [profile, fetchProposals]);

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



