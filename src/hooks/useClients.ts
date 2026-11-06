import { useState, useCallback } from 'react';
import { clientService, type ListResult, type QueryOptions, type ServiceResult } from '../services';
import type { Cliente } from '@/types';
import { useAuth } from './useAuth';

interface UseClientsReturn {
  // Data
  clients: Cliente[];
  isLoading: boolean;
  error: Error | null;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number | null;
  // Actions
  fetchClients: (options?: QueryOptions) => Promise<void>;
  createClient: (client: Omit<Cliente, 'id' | 'created_at'>) => Promise<ServiceResult<Cliente>>;
  updateClient: (id: string, updates: Partial<Cliente>) => Promise<ServiceResult<Cliente>>;
  deleteClient: (id: string) => Promise<ServiceResult<void>>;
  searchClients: (query: string, options?: QueryOptions) => Promise<void>;
  refresh: () => Promise<void>;
  // Pagination helpers
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export const useClients = (): UseClientsReturn => {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
  const [lastOptions, setLastOptions] = useState<QueryOptions>({});

  const fetchClients = useCallback(async (options: QueryOptions = {}) => {
    if (!profile) return;

    setIsLoading(true);
    setError(null);

    try {
      let result: ListResult<Cliente>;

      if (lastSearchQuery.trim()) {
        result = await clientService.searchForProfile(profile.id, lastSearchQuery, {
          ...lastOptions,
          ...options,
          page: options.page || 1,
        });
      } else {
        result = await clientService.listForProfile(profile.id, {
          ...lastOptions,
          ...options,
          page: options.page || 1,
        });
      }

      if (result.success) {
        setClients(result.data || []);
        setTotalCount(result.count);
        setTotalPages(result.totalPages);
        setCurrentPage(result.page);
      } else {
        setError(new Error(result.error?.message || 'Failed to fetch clients'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [profile, lastSearchQuery, lastOptions]);

  const searchClients = useCallback(async (query: string, options: QueryOptions = {}) => {
    setLastSearchQuery(query);
    setLastOptions(options);
    await fetchClients({ ...options, page: 1 });
  }, [fetchClients]);

  const createClient = useCallback(async (client: Omit<Cliente, 'id' | 'created_at'>) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await clientService.createForProfile(profile.id, client);
    if (result.success) {
      await fetchClients(); // Refresh list
    }
    return result;
  }, [profile, fetchClients]);

  const updateClient = useCallback(async (id: string, updates: Partial<Cliente>) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await clientService.updateForProfile(profile.id, id, updates);
    if (result.success) {
      await fetchClients(); // Refresh list
    }
    return result;
  }, [profile, fetchClients]);

  const deleteClient = useCallback(async (id: string) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await clientService.deleteForProfile(profile.id, id);
    if (result.success) {
      await fetchClients(); // Refresh list
    }
    return result;
  }, [profile, fetchClients]);

  const refresh = useCallback(async () => {
    await fetchClients({ page: currentPage });
  }, [fetchClients, currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchClients({ page });
    }
  }, [fetchClients, totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchClients({ page: currentPage + 1 });
    }
  }, [fetchClients, currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchClients({ page: currentPage - 1 });
    }
  }, [fetchClients, currentPage]);

  return {
    clients,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    refresh,
    goToPage,
    nextPage,
    prevPage,
  };
};



