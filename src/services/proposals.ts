import { BaseService, type ListResult, type QueryOptions, type ServiceResult } from './base';
import type { Proposta, ProposalItem, ProposalStatus } from '@/types';

// Database row types (matching Supabase schema)
interface BudgetRow {
  id: string;
  profile_id: string;
  client_id: string | null;
  title: string;
  status: string;
  public_token: string;
  public_token_enabled: boolean;
  total_amount: number;
  created_at: string;
  updated_at: string;
}

interface BudgetInsert {
  profile_id: string;
  client_id?: string | null;
  title: string;
  status?: string;
  public_token_enabled?: boolean;
  total_amount?: number;
}

interface BudgetUpdate {
  client_id?: string | null;
  title?: string;
  status?: string;
  public_token_enabled?: boolean;
  total_amount?: number;
  updated_at?: string;
}

interface BudgetItemRow {
  id: string;
  budget_id: string;
  catalog_item_id: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

interface BudgetItemInsert {
  budget_id: string;
  catalog_item_id?: string | null;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Transform database rows to application types
const toProposta = (budget: BudgetRow, items: BudgetItemRow[]): Proposta => ({
  id: budget.id,
  numero: `ORC-${new Date(budget.created_at).getFullYear()}-${budget.id.slice(-4).toUpperCase()}`,
  clienteId: budget.client_id || '',
  itens: items.map(item => ({
    id: item.id,
    descricao: item.description,
    quantidade: item.quantity,
    valorUnitario: item.unit_price,
  })),
  desconto: 0,
  validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  status: budget.status as ProposalStatus,
  created_at: budget.created_at,
  updated_at: budget.updated_at,
});

const toBudgetInsert = (proposta: Omit<Proposta, 'id' | 'numero' | 'created_at' | 'updated_at'>, profileId: string): BudgetInsert => ({
  profile_id: profileId,
  client_id: proposta.clienteId || null,
  title: `Proposta ${proposta.clienteId}`,
  status: proposta.status,
  public_token_enabled: true,
  total_amount: proposta.itens.reduce((sum: number, item: ProposalItem) => sum + item.quantidade * item.valorUnitario, 0),
});

const toBudgetUpdate = (proposta: Partial<Proposta>): BudgetUpdate => {
  const update: BudgetUpdate = { updated_at: new Date().toISOString() };
  if (proposta.clienteId !== undefined) update.client_id = proposta.clienteId || null;
  if (proposta.status !== undefined) update.status = proposta.status;
  if (proposta.itens !== undefined) {
    update.total_amount = proposta.itens.reduce((sum: number, item: ProposalItem) => sum + item.quantidade * item.valorUnitario, 0);
  }
  return update;
};

const toBudgetItemInsert = (budgetId: string, item: { descricao: string; quantidade: number; valorUnitario: number }): BudgetItemInsert => ({
  budget_id: budgetId,
  description: item.descricao,
  quantity: item.quantidade,
  unit_price: item.valorUnitario,
  total_price: item.quantidade * item.valorUnitario,
});

class ProposalService extends BaseService<BudgetRow, BudgetInsert> {
  protected tableName = 'budgets';

  // List proposals for current user's profile
  async listForProfile(profileId: string, options: QueryOptions = {}): Promise<ListResult<Proposta>> {
    const { data: budgets, error, count, page, pageSize, totalPages } = await this.list({
      ...options,
      filters: { ...options.filters, profile_id: profileId },
    });

    if (error || !budgets) {
      return { data: null, error, success: false, count: null, page: page || 1, pageSize: pageSize || 20, totalPages: 0 };
    }

    // Fetch items for all budgets
    const budgetIds = budgets.map(b => b.id);
    const { data: items, error: itemsError } = await this.client
      .from('budget_items')
      .select('*')
      .in('budget_id', budgetIds);

    if (itemsError) {
      return { data: null, error: itemsError, success: false, count: null, page: page || 1, pageSize: pageSize || 20, totalPages: 0 };
    }

    // Group items by budget_id
    const itemsByBudget = new Map<string, BudgetItemRow[]>();
    (items || []).forEach(item => {
      const existing = itemsByBudget.get(item.budget_id) || [];
      existing.push(item);
      itemsByBudget.set(item.budget_id, existing);
    });

    const propostas = budgets.map(budget => toProposta(budget, itemsByBudget.get(budget.id) || []));

    return {
      data: propostas,
      error: null,
      success: true,
      count,
      page: page || 1,
      pageSize: pageSize || 20,
      totalPages: totalPages || 0,
    };
  }

  // Search proposals
  async searchForProfile(
    profileId: string,
    query: string,
    options: QueryOptions = {}
  ): Promise<ListResult<Proposta>> {
    const result = await this.search(query, ['title'], {
      ...options,
      filters: { ...options.filters, profile_id: profileId },
    });

    if (!result.data) return { ...result, data: null };

    // Fetch items for results
    const budgetIds = result.data.map(b => b.id);
    const { data: items } = await this.client
      .from('budget_items')
      .select('*')
      .in('budget_id', budgetIds);

    const itemsByBudget = new Map<string, BudgetItemRow[]>();
    (items || []).forEach(item => {
      const existing = itemsByBudget.get(item.budget_id) || [];
      existing.push(item);
      itemsByBudget.set(item.budget_id, existing);
    });

    return {
      ...result,
      data: result.data.map(budget => toProposta(budget, itemsByBudget.get(budget.id) || [])),
    };
  }

  // Get proposal by ID with items
  async getByIdForProfile(profileId: string, id: string): Promise<ServiceResult<Proposta>> {
    const { data: budget, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('profile_id', profileId)
      .single();

    if (error || !budget) {
      return { data: null, error, success: false };
    }

    const { data: items } = await this.client
      .from('budget_items')
      .select('*')
      .eq('budget_id', id);

    return {
      data: toProposta(budget, items || []),
      error: null,
      success: true,
    };
  }

  // Get public proposal by token (for public portal)
  async getByPublicToken(token: string): Promise<ServiceResult<Proposta>> {
    const { data: budget, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('public_token', token)
      .eq('public_token_enabled', true)
      .single();

    if (error || !budget) {
      return { data: null, error, success: false };
    }

    const { data: items } = await this.client
      .from('budget_items')
      .select('*')
      .eq('budget_id', budget.id);

    return {
      data: toProposta(budget, items || []),
      error: null,
      success: true,
    };
  }

  // Create proposal with items
  async createWithItems(
    profileId: string,
    proposta: Omit<Proposta, 'id' | 'numero' | 'created_at' | 'updated_at'>
  ): Promise<ServiceResult<Proposta>> {
    // Create budget
    const budgetResult = await this.create(toBudgetInsert(proposta, profileId));
    if (!budgetResult.success || !budgetResult.data) {
      return { data: null, error: budgetResult.error, success: false };
    }

    const budget = budgetResult.data;

    // Create budget items
    const itemsToInsert = proposta.itens.map(item => toBudgetItemInsert(budget.id, item));
    const { error: itemsError } = await this.client
      .from('budget_items')
      .insert(itemsToInsert);

    if (itemsError) {
      // Rollback budget creation
      await this.client.from(this.tableName).delete().eq('id', budget.id);
      return { data: null, error: itemsError, success: false };
    }

    // Fetch created items
    const { data: createdItems } = await this.client
      .from('budget_items')
      .select('*')
      .eq('budget_id', budget.id);

    return {
      data: toProposta(budget, createdItems || []),
      error: null,
      success: true,
    };
  }

  // Update proposal with items
  async updateWithItems(
    profileId: string,
    id: string,
    proposta: Partial<Proposta>
  ): Promise<ServiceResult<Proposta>> {
    // Update budget
    const { data: budget, error: budgetError } = await this.client
      .from(this.tableName)
      .update(toBudgetUpdate(proposta))
      .eq('id', id)
      .eq('profile_id', profileId)
      .select()
      .single();

    if (budgetError || !budget) {
      return { data: null, error: budgetError, success: false };
    }

    // If items provided, replace all items
    if (proposta.itens) {
      // Delete existing items
      await this.client.from('budget_items').delete().eq('budget_id', id);

      // Insert new items
      const itemsToInsert = proposta.itens!.map(item => toBudgetItemInsert(id, item));
      const { error: itemsError } = await this.client
        .from('budget_items')
        .insert(itemsToInsert);

      if (itemsError) {
        return { data: null, error: itemsError, success: false };
      }
    }

    // Fetch updated items
    const { data: items } = await this.client
      .from('budget_items')
      .select('*')
      .eq('budget_id', id);

    return {
      data: toProposta(budget, items || []),
      error: null,
      success: true,
    };
  }

  // Update proposal (for status updates)
  async updateForProfile(
    profileId: string,
    id: string,
    updates: Partial<Proposta>
  ): Promise<ServiceResult<Proposta>> {
    const { data: budget, error } = await this.client
      .from(this.tableName)
      .update(toBudgetUpdate(updates))
      .eq('id', id)
      .eq('profile_id', profileId)
      .select()
      .single();

    if (error || !budget) {
      return { data: null, error, success: false };
    }

    const { data: items } = await this.client
      .from('budget_items')
      .select('*')
      .eq('budget_id', id);

    return {
      data: toProposta(budget, items || []),
      error: null,
      success: true,
    };
  }

  // Update proposal status
  async updateStatus(profileId: string, id: string, status: ProposalStatus): Promise<ServiceResult<Proposta>> {
    return this.updateForProfile(profileId, id, { status } as Partial<Proposta>);
  }

  // Accept proposal (public)
  async acceptByToken(token: string): Promise<ServiceResult<Proposta>> {
    const { data: budget, error } = await this.client
      .from(this.tableName)
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('public_token', token)
      .eq('public_token_enabled', true)
      .select()
      .single();

    if (error || !budget) {
      return { data: null, error, success: false };
    }

    const { data: items } = await this.client
      .from('budget_items')
      .select('*')
      .eq('budget_id', budget.id);

    return {
      data: toProposta(budget, items || []),
      error: null,
      success: true,
    };
  }

  // Reject proposal (public)
  async rejectByToken(token: string): Promise<ServiceResult<Proposta>> {
    const { data: budget, error } = await this.client
      .from(this.tableName)
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('public_token', token)
      .eq('public_token_enabled', true)
      .select()
      .single();

    if (error || !budget) {
      return { data: null, error, success: false };
    }

    const { data: items } = await this.client
      .from('budget_items')
      .select('*')
      .eq('budget_id', budget.id);

    return {
      data: toProposta(budget, items || []),
      error: null,
      success: true,
    };
  }

  // Delete proposal (scoped to profile)
  async deleteForProfile(profileId: string, id: string): Promise<ServiceResult<void>> {
    // Delete items first (cascade should handle this, but explicit is safer)
    await this.client.from('budget_items').delete().eq('budget_id', id);

    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('profile_id', profileId);

    return { data: null, error, success: !error };
  }

  // Duplicate proposal
  async duplicateForProfile(profileId: string, id: string): Promise<ServiceResult<Proposta>> {
    const original = await this.getByIdForProfile(profileId, id);
    if (!original.success || !original.data) {
      return { data: null, error: original.error, success: false };
    }

    const duplicated = {
      ...original.data,
      status: 'draft' as ProposalStatus,
      clienteId: original.data.clienteId,
      itens: original.data.itens.map((item: ProposalItem) => ({ ...item, id: crypto.randomUUID() })),
    };

    return this.createWithItems(profileId, duplicated);
  }
}

export const proposalService = new ProposalService();
export type { BudgetRow, BudgetInsert, BudgetUpdate, BudgetItemRow, BudgetItemInsert };



