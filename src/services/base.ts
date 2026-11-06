import { supabase } from '../infrastructure/supabaseClient';
import type { PostgrestError } from '@supabase/supabase-js';

// Generic result type for service operations
export interface ServiceResult<T> {
  data: T | null;
  error: PostgrestError | Error | null;
  success: boolean;
}

// Generic list result with pagination
export interface ListResult<T> extends ServiceResult<T[]> {
  count: number | null;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

// Sort parameters
export interface SortParams {
  column?: string;
  ascending?: boolean;
}

// Filter parameters
export interface FilterParams {
  [key: string]: unknown;
}

// Base query options
export interface QueryOptions extends PaginationParams, SortParams {
  filters?: FilterParams;
}

// Base service class with common CRUD operations
export abstract class BaseService<T extends { id: string }, TInsert = Omit<T, 'id' | 'created_at' | 'updated_at'>> {
  protected abstract tableName: string;

  protected get client() {
    return supabase;
  }

  // Build query with filters, sorting, and pagination
  protected buildQuery(options: QueryOptions = {}) {
    const {
      page = 1,
      pageSize = 20,
      column = 'created_at',
      ascending = false,
      filters = {},
    } = options;

    let query = this.client.from(this.tableName).select('*', { count: 'exact' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value);
        } else if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply sorting
    query = query.order(column, { ascending });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    return query;
  }

  // Get all items with pagination
  async list(options: QueryOptions = {}): Promise<ListResult<T>> {
    const query = this.buildQuery(options);
    const { data, error, count } = await query;

    if (error) {
      return {
        data: null,
        error,
        success: false,
        count: null,
        page: options.page || 1,
        pageSize: options.pageSize || 20,
        totalPages: 0,
      };
    }

    const pageSize = options.pageSize || 20;
    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      data: data as T[],
      error: null,
      success: true,
      count,
      page: options.page || 1,
      pageSize,
      totalPages,
    };
  }

  // Get single item by ID
  async getById(id: string): Promise<ServiceResult<T>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: data as T, error: null, success: true };
  }

  // Create new item
  async create(item: TInsert): Promise<ServiceResult<T>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(item as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: data as T, error: null, success: true };
  }

  // Update existing item
  async update(id: string, updates: Partial<T>): Promise<ServiceResult<T>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update(updates as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: data as T, error: null, success: true };
  }

  // Delete item
  async delete(id: string): Promise<ServiceResult<void>> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: null, error: null, success: true };
  }

  // Search with text query
  async search(query: string, searchColumns: string[], options: QueryOptions = {}): Promise<ListResult<T>> {
    const { page = 1, pageSize = 20, column = 'created_at', ascending = false, filters = {} } = options;

    let supabaseQuery = this.client.from(this.tableName).select('*', { count: 'exact' });

    // Build OR filter for search columns
    if (query.trim()) {
      const orConditions = searchColumns.map(col => `${col}.ilike.%${query}%`).join(',');
      supabaseQuery = supabaseQuery.or(orConditions);
    }

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          supabaseQuery = supabaseQuery.in(key, value);
        } else {
          supabaseQuery = supabaseQuery.eq(key, value);
        }
      }
    });

    // Apply sorting and pagination
    supabaseQuery = supabaseQuery.order(column, { ascending });
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    supabaseQuery = supabaseQuery.range(from, to);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      return {
        data: null,
        error,
        success: false,
        count: null,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    const totalPages = count ? Math.ceil(count / pageSize) : 0;

    return {
      data: data as T[],
      error: null,
      success: true,
      count,
      page,
      pageSize,
      totalPages,
    };
  }
}

// Error handling utilities
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'ServiceError';
  }

  static fromPostgrestError(error: PostgrestError): ServiceError {
    return new ServiceError(
      error.message,
      error.code || 'UNKNOWN_ERROR',
      error
    );
  }
}

export const handleServiceError = (error: unknown, context: string): ServiceError => {
  if (error instanceof ServiceError) return error;
  if (error instanceof Error) return new ServiceError(`${context}: ${error.message}`, 'SERVICE_ERROR', error);
  return new ServiceError(`${context}: Unknown error`, 'UNKNOWN_ERROR');
};



