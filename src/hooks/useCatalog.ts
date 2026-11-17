import { useState, useCallback } from 'react';
import { catalogService, type ListResult, type QueryOptions, type ServiceResult } from '../services';
import type { ServiceTemplate, CreateServiceInput, UpdateServiceInput } from '@/types';
import { useAuth } from './useAuth';
import { useDemoAuth } from '../infrastructure/demoAuth';

interface UseCatalogReturn {
  // Data
  items: ServiceTemplate[];
  laborItems: ServiceTemplate[];
  materialItems: ServiceTemplate[];
  isLoading: boolean;
  error: Error | null;
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number | null;
  // Actions
  fetchCatalog: (options?: QueryOptions) => Promise<void>;
  fetchByType: (type: 'labor' | 'material', options?: QueryOptions) => Promise<void>;
  createItem: (item: CreateServiceInput) => Promise<ServiceResult<ServiceTemplate>>;
  updateItem: (id: string, updates: UpdateServiceInput) => Promise<ServiceResult<ServiceTemplate>>;
  deleteItem: (id: string) => Promise<ServiceResult<void>>;
  searchCatalog: (query: string, options?: QueryOptions) => Promise<void>;
  refresh: () => Promise<void>;
  // Pagination helpers
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export const useCatalog = (): UseCatalogReturn => {
  const { profile, isAuthenticated } = useAuth();
  const { signOut: demoSignOut } = useDemoAuth();
  const [items, setItems] = useState<ServiceTemplate[]>([]);
  const [laborItems, setLaborItems] = useState<ServiceTemplate[]>([]);
  const [materialItems, setMaterialItems] = useState<ServiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState<string>('');
  const [lastOptions, setLastOptions] = useState<QueryOptions>({});

  const fetchCatalog = useCallback(async (options: QueryOptions = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        // Demo mode - return empty state
        setItems([]);
        setLaborItems([]);
        setMaterialItems([]);
        setTotalCount(0);
        setTotalPages(0);
        setCurrentPage(1);
        return;
      }

      if (!profile) {
        await fetchCatalog({ page: 1, pageSize: 20 });
        return;
      }

      let result: ListResult<ServiceTemplate>;

      if (lastSearchQuery.trim()) {
        result = await catalogService.searchForProfile(profile.id, lastSearchQuery, {
          ...lastOptions,
          ...options,
          page: options.page || 1,
        });
      } else {
        result = await catalogService.listForProfile(profile.id, {
          ...lastOptions,
          ...options,
          page: options.page || 1,
        });
      }

      if (result.success) {
        setItems(result.data || []);
        setLaborItems((result.data || []).filter((i: any) => i.tipo === 'labor'));
        setMaterialItems((result.data || []).filter((i: any) => i.tipo === 'material'));
        setTotalCount(result.count);
        setTotalPages(result.totalPages);
        setCurrentPage(result.page);
      } else {
        setError(new Error(result.error?.message || 'Failed to fetch catalog'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [profile, isAuthenticated, lastSearchQuery, lastOptions]);

  const fetchByType = useCallback(async (type: 'labor' | 'material', options: QueryOptions = {}) => {
    if (!isAuthenticated) {
      // Demo mode - return empty state
      setLaborItems([]);
      setMaterialItems([]);
      return;
    }

    if (!profile) return;

    let result: ListResult<ServiceTemplate>;

    if (lastSearchQuery.trim()) {
      result = await catalogService.searchForProfile(profile.id, lastSearchQuery, {
        ...lastOptions,
        ...options,
        page: options.page || 1,
      });
    } else {
      result = await catalogService.listForProfile(profile.id, {
        ...lastOptions,
        ...options,
        page: options.page || 1,
      });
    }

    if (result.success) {
      if (type === 'labor') {
        setLaborItems(result.data || []);
      } else {
        setMaterialItems(result.data || []);
      }
    }
  }, [profile, isAuthenticated, lastSearchQuery, lastOptions]);

  const searchCatalog = useCallback(async (query: string, options: QueryOptions = {}) => {
    setLastSearchQuery(query);
    setLastOptions(options);
    await fetchCatalog({ ...options, page: 1 });
  }, [fetchCatalog]);

  const createItem = useCallback(async (item: CreateServiceInput) => {
    if (!isAuthenticated) {
      // Demo mode - create in localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      const newItem: ServiceTemplate = {
        id: crypto.randomUUID(),
        profile_id: crypto.randomUUID(),
        nome: item.nome,
        tipo: item.tipo,
        horas: 1,
        valorHora: item.valorHora || 0,
        materiais: item.materiais || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      demoData.items = demoData.items || [];
      demoData.items.push(newItem);
      localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
      setItems([...demoData.items]);
      return { data: newItem, error: null, success: true };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await catalogService.createForProfile(profile.id, item);
    if (result.success) {
      await fetchCatalog(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated]);

  const updateItem = useCallback(async (id: string, updates: UpdateServiceInput) => {
    if (!isAuthenticated) {
      // Demo mode - update in localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      const itemIndex = demoData.items?.findIndex((i: any) => i.id === id);
      if (itemIndex >= 0) {
        demoData.items[itemIndex] = { ...demoData.items[itemIndex], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
        setItems([...demoData.items]);
      }
      return { data: demoData.items[itemIndex], error: null, success: true };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await catalogService.updateForProfile(profile.id, id, updates);
    if (result.success) {
      await fetchCatalog(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated]);

  const deleteItem = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      // Demo mode - remove from localStorage
      const demoData = JSON.parse(localStorage.getItem('orcafacil_demo_data') || '{}');
      demoData.items = demoData.items?.filter((i: any) => i.id !== id) || [];
      localStorage.setItem('orcafacil_demo_data', JSON.stringify(demoData));
      setItems([...demoData.items]);
      return { data: null, error: null, success: true };
    }

    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await catalogService.deleteForProfile(profile.id, id);
    if (result.success) {
      await fetchCatalog(); // Refresh list
    }
    return result;
  }, [profile, isAuthenticated]);

  const refresh = useCallback(async () => {
    await fetchCatalog({ page: currentPage });
  }, [fetchCatalog, currentPage]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchCatalog({ page });
    }
  }, [fetchCatalog, totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      fetchCatalog({ page: currentPage + 1 });
    }
  }, [fetchCatalog, currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      fetchCatalog({ page: currentPage - 1 });
    }
  }, [fetchCatalog, currentPage]);

  return {
    items,
    laborItems,
    materialItems,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    fetchCatalog,
    fetchByType,
    createItem,
    updateItem,
    deleteItem,
    searchCatalog,
    refresh,
    goToPage,
    nextPage,
    prevPage,
  };
};