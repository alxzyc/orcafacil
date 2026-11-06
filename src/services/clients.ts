import { BaseService, type ListResult, type QueryOptions, type ServiceResult } from './base';
import type { Cliente } from '@/types';

// Database row types (matching Supabase schema)
interface ClientRow {
  id: string;
  profile_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

interface ClientInsert {
  profile_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface ClientUpdate {
  name?: string;
  email?: string | null;
  phone?: string | null;
}

// Transform database row to application type
const toCliente = (row: ClientRow): Cliente => ({
  id: row.id,
  nome: row.name,
  email: row.email || undefined,
  telefone: row.phone || undefined,
  created_at: row.created_at,
});

const toClientRow = (cliente: Cliente, profileId: string): ClientInsert => ({
  profile_id: profileId,
  name: cliente.nome,
  email: cliente.email || null,
  phone: cliente.telefone || null,
});

const toClientUpdate = (cliente: Partial<Cliente>): ClientUpdate => {
  const update: ClientUpdate = {};
  if (cliente.nome !== undefined) update.name = cliente.nome;
  if (cliente.email !== undefined) update.email = cliente.email || null;
  if (cliente.telefone !== undefined) update.phone = cliente.telefone || null;
  return update;
};

class ClientService extends BaseService<ClientRow, ClientInsert> {
  protected tableName = 'clients';

  // List clients for current user's profile
  async listForProfile(profileId: string, options: QueryOptions = {}): Promise<ListResult<Cliente>> {
    const result = await this.list({
      ...options,
      filters: { ...options.filters, profile_id: profileId },
    });

    return {
      ...result,
      data: result.data?.map(toCliente) || null,
    };
  }

  // Search clients by name/email
  async searchForProfile(
    profileId: string,
    query: string,
    options: QueryOptions = {}
  ): Promise<ListResult<Cliente>> {
    const result = await this.search(query, ['name', 'email'], {
      ...options,
      filters: { ...options.filters, profile_id: profileId },
    });

    return {
      ...result,
      data: result.data?.map(toCliente) || null,
    };
  }

  // Get client by ID (scoped to profile)
  async getByIdForProfile(profileId: string, id: string): Promise<ServiceResult<Cliente>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('profile_id', profileId)
      .single();

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: toCliente(data as ClientRow), error: null, success: true };
  }

  // Create client for profile
  async createForProfile(profileId: string, cliente: Omit<Cliente, 'id' | 'created_at'>): Promise<ServiceResult<Cliente>> {
    const result = await this.create(toClientRow(cliente as Cliente, profileId));

    return {
      ...result,
      data: result.data ? toCliente(result.data) : null,
    };
  }

  // Update client (scoped to profile)
  async updateForProfile(profileId: string, id: string, updates: Partial<Cliente>): Promise<ServiceResult<Cliente>> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update(toClientUpdate(updates))
      .eq('id', id)
      .eq('profile_id', profileId)
      .select()
      .single();

    if (error) {
      return { data: null, error, success: false };
    }

    return { data: toCliente(data as ClientRow), error: null, success: true };
  }

  // Delete client (scoped to profile)
  async deleteForProfile(profileId: string, id: string): Promise<ServiceResult<void>> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('profile_id', profileId);

    return { data: null, error, success: !error };
  }

  // Get client count for profile
  async countForProfile(profileId: string): Promise<number> {
    const { count, error } = await this.client
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId);

    if (error) return 0;
    return count || 0;
  }
}

export const clientService = new ClientService();
export type { ClientRow, ClientInsert, ClientUpdate };



