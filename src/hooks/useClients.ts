import { useState, useCallback } from 'react';
import { clientService, type ListResult, type QueryOptions, type ServiceResult } from '../services';
import type { Cliente } from '@/types';
import { useAuth } from './useAuth';
import { useDemoAuth } from '../infrastructure/demoAuth';

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
  createClient: (client: { nome: string; email?: string; telefone?: string }) => Promise<ServiceResult<Cliente>>;
  updateClient: (id: string, updates: { nome?: string; email?: string; telefone?: string }) => Promise<ServiceResult<Cliente>>;
  deleteClient: (id: string) => Promise<ServiceResult<void>>;
  searchClients: (query: string, options?: QueryOptions) => Promise<void>;
  refresh: () => Promise<void>;
  // Pagination helpers
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export const useClients = (): UseClientsReturn => {
  const { profile, isAuthenticated } = useAuth();
  const { signOut: demoSignOut } = useDemoAuth();
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
  const [lastOptions, setLastOptions] = useState<QueryOptions>({});

  const fetchClients = useCallback(async (options: QueryOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      let result: ListResult<Cliente>;

      if (!isAuthenticated) {
        // Demo mode - return empty state
        setClients([]);
        setTotalCount(0);
        setTotalPages(0);
        setCurrentPage(1);
        return;
      }

      if (!profile) {
        await fetchClients({ page: 1, pageSize: 20 });
        return;
      }

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
  }, [profile, isAuthenticated, lastSearchQuery, lastOptions]);

  const searchClients = useCallback(async (query: string, options: QueryOptions = {}) => {
    setLastSearchQuery(query);
    setLastOptions(options);
    await fetchClients({ ...options, page: 1 });
  }, [fetchClients]);

  const createClient = useCallback(async (client: { nome: string; email?: string; telefone?: string }) => {
    if (!isAuthenticated) {
      // Demo mode - create in localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      const newClient = {
        id: crypto.randomUUID(),
        profile_id: crypto.randomUUID(),
        nome: client.nome,
        email: client.email,
        telefone: client.telefone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoData.clients = demoData.clients || [];
      demoData.clients.push(newClient);
      localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
      setClients([...demoData.clients, newClient]);
      setTotalCount((demoData.totalCount || 0) + 1);
      return { data: newClient, error: null, success: true };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await clientService.createForProfile(profile.id, {
      nome: client.nome,
      email: client.email,
      telefone: client.telefone,
    });
    if (result.success) {
      await fetchClients(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated]);

  const updateClient = useCallback(async (id: string, updates: { nome?: string; email?: string; telefone?: string }) => {
    if (!isAuthenticated) {
      // Demo mode - update in localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      const clientIndex = demoData.clients?.findIndex((c: any) => c.id === id);
      if (clientIndex >= 0) {
        demoData.clients[clientIndex] = { ...demoData.clients[clientIndex], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
        setClients([...demoData.clients]);
      }
      return { data: demoData.clients[clientIndex], error: null, success: true };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await clientService.updateForProfile(profile.id, id, updates);
    if (result.success) {
      await fetchClients(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated]);

  const deleteClient = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      // Demo mode - remove from localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      demoData.clients = demoData.clients?.filter((c: any) => c.id !== id) || [];
      localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
      setClients([...demoData.clients]);
      setTotalCount(demoData.totalCount != null ? demoData.totalCount - 1 : 0);
      return { data: null, error: null, success: true };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await clientService.deleteForProfile(profile.id, id);
    if (result.success) {
      await fetchClients(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated]);

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