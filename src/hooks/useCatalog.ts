import { useState, useCallback } from 'react';
import { catalogService, type ListResult, type QueryOptions, type ServiceResult } from '../services';
import type { ServiceTemplate } from '@/types';
import { useAuth } from './useAuth';

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
  createItem: (item: Omit<ServiceTemplate, 'id'>) => Promise<ServiceResult<ServiceTemplate>>;
  updateItem: (id: string, updates: Partial<ServiceTemplate>) => Promise<ServiceResult<ServiceTemplate>>;
  deleteItem: (id: string) => Promise<ServiceResult<void>>;
  searchCatalog: (query: string, options?: QueryOptions) => Promise<void>;
  refresh: () => Promise<void>;
  // Pagination helpers
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export const useCatalog = (): UseCatalogReturn => {
  const { profile } = useAuth();
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
    if (!profile) return;

    setIsLoading(true);
    setError(null);

    try {
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
  }, [profile, lastSearchQuery, lastOptions]);

  const fetchByType = useCallback(async (type: 'labor' | 'material', options: QueryOptions = {}) => {
    if (!profile) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await catalogService.listByTypeForProfile(profile.id, type, options);

      if (result.success) {
        if (type === 'labor') {
          setLaborItems(result.data || []);
        } else {
          setMaterialItems(result.data || []);
        }
      } else {
        setError(new Error(result.error?.message || `Failed to fetch ${type} items`));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [profile]);

  const searchCatalog = useCallback(async (query: string, options: QueryOptions = {}) => {
    setLastSearchQuery(query);
    setLastOptions(options);
    await fetchCatalog({ ...options, page: 1 });
  }, [fetchCatalog]);

  const createItem = useCallback(async (item: Omit<ServiceTemplate, 'id'>) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await catalogService.createForProfile(profile.id, item);
    if (result.success) {
      await fetchCatalog(); // Refresh list
    }
    return result;
  }, [profile, fetchCatalog]);

  const updateItem = useCallback(async (id: string, updates: Partial<ServiceTemplate>) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await catalogService.updateForProfile(profile.id, id, updates);
    if (result.success) {
      await fetchCatalog(); // Refresh list
    }
    return result;
  }, [profile, fetchCatalog]);

  const deleteItem = useCallback(async (id: string) => {
    if (!profile) return { data: null, error: new Error('Not authenticated'), success: false };

    const result = await catalogService.deleteForProfile(profile.id, id);
    if (result.success) {
      await fetchCatalog(); // Refresh list
    }
    return result;
  }, [profile, fetchCatalog]);

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



