import { BaseService, type ListResult, type QueryOptions, type ServiceResult } from './base';
import type { ServiceTemplate, CreateServiceInput, UpdateServiceInput } from '@/types';

// Database row types
interface CatalogItemRow {
  id: string;
  profile_id: string;
  name: string;
  type: 'material' | 'labor';
  unit: string | null;
  unit_cost: number;
  default_markup: number;
  created_at: string;
}

interface CatalogItemInsert {
  profile_id: string;
  name: string;
  type: 'material' | 'labor';
  unit?: string | null;
  unit_cost: number;
  default_markup?: number;
}

interface CatalogItemUpdate {
  name?: string;
  type?: 'material' | 'labor';
  unit?: string | null;
  unit_cost?: number;
  default_markup?: number;
}

// Transform to application type
const toServiceTemplate = (row: CatalogItemRow): ServiceTemplate => ({
  id: row.id,
  profile_id: row.profile_id,
  nome: row.name,
  tipo: row.type,
  horas: row.type === 'labor' ? 1 : 0,
  valorHora: row.type === 'labor' ? row.unit_cost : 0,
  materiais: row.type === 'material' ? row.unit_cost : 0,
  created_at: row.created_at,
  updated_at: row.created_at,
});

const toCatalogInsert = (template: CreateServiceInput, profileId: string): CatalogItemInsert => {
  return {
    profile_id: profileId,
    name: template.nome,
    type: template.tipo,
    unit: template.tipo === 'labor' ? 'hora' : 'unidade',
    unit_cost: template.tipo === 'labor' ? template.valorHora : template.materiais,
    default_markup: 0,
  };
};

const toCatalogUpdate = (template: UpdateServiceInput): CatalogItemUpdate => {
  const update: CatalogItemUpdate = {};
  if (template.nome !== undefined) update.name = template.nome;
  if (template.tipo !== undefined) update.type = template.tipo;
  if (template.horas !== undefined || template.valorHora !== undefined || template.materiais !== undefined) {
    if (template.tipo === 'labor' || (template.tipo === undefined && template.valorHora !== undefined)) {
      update.unit_cost = template.valorHora ?? 0;
    } else {
      update.unit_cost = template.materiais ?? 0;
    }
  }
  return update;
};

class CatalogService extends BaseService<CatalogItemRow, CatalogItemInsert> {
  protected tableName = 'catalog_items';

  // List catalog items for profile
  async listForProfile(profileId: string, options: QueryOptions = {}): Promise<ListResult<ServiceTemplate>> {
    const result = await this.list({
      ...options,
      filters: { ...options.filters, profile_id: profileId },
    });

    return {
      ...result,
      data: result.data?.map(toServiceTemplate) || null,
    };
  }

  // Get items by type
  async listByTypeForProfile(
    profileId: string,
    type: 'material' | 'labor',
    options: QueryOptions = {}
  ): Promise<ListResult<ServiceTemplate>> {
    const result = await this.list({
      ...options,
      filters: { ...options.filters, profile_id: profileId, type },
    });

    return {
      ...result,
      data: result.data?.map(toServiceTemplate) || null,
    };
  }

  // Search catalog
  async searchForProfile(
    profileId: string,
    query: string,
    options: QueryOptions = {}
  ): Promise<ListResult<ServiceTemplate>> {
    const result = await this.search(query, ['name'], {
      ...options,
      filters: { ...options.filters, profile_id: profileId },
    });

    return {
      ...result,
      data: result.data?.map(toServiceTemplate) || null,
    };
  }

  // Get by ID
  async getByIdForProfile(profileId: string, id: string): Promise<ServiceResult<ServiceTemplate>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('profile_id', profileId)
      .single();

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: toServiceTemplate(data as CatalogItemRow), error: null, success: true };
  }

  // Create
  async createForProfile(
    profileId: string,
    template: CreateServiceInput
  ): Promise<ServiceResult<ServiceTemplate>> {
    const result = await this.create(toCatalogInsert(template, profileId));

    return {
      ...result,
      data: result.data ? toServiceTemplate(result.data) : null,
    };
  }

  // Update
  async updateForProfile(
    profileId: string,
    id: string,
    updates: UpdateServiceInput
  ): Promise<ServiceResult<ServiceTemplate>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update(toCatalogUpdate(updates))
      .eq('id', id)
      .eq('profile_id', profileId)
      .select()
      .single();

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: toServiceTemplate(data as CatalogItemRow), error: null, success: true };
  }

  // Delete
  async deleteForProfile(profileId: string, id: string): Promise<ServiceResult<void>> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('profile_id', profileId);

    return { data: null, error, success: !error };
  }
}

export const catalogService = new CatalogService();
export type { CatalogItemRow, CatalogItemInsert, CatalogItemUpdate };