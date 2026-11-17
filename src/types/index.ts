export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  company_name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Cliente {
  id: string;
  profile_id: string;
  nome: string;
  email?: string;
  telefone?: string;
  created_at: string;
  updated_at: string;
}

export type ProposalStatus = 'rascunho' | 'enviada' | 'aceita' | 'recusada' | 'expirada';

export interface ProposalItem {
  id: string;
  proposal_id?: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  created_at?: string;
}

export interface Proposta {
  id: string;
  profile_id: string;
  clienteId: string;
  numero: string;
  itens: ProposalItem[];
  desconto: number;
  validade: string;
  condicoes?: string;
  status: ProposalStatus;
  public_token?: string;
  public_token_enabled?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceTemplate {
  id: string;
  profile_id: string;
  nome: string;
  tipo: 'labor' | 'material';
  horas: number;
  valorHora: number;
  materiais: number;
  created_at: string;
  updated_at: string;
}

export interface PricingCalculation {
  horas: number;
  valorHora: number;
  materiais: number;
  margem: number;
  impostos: number;
  rounding: RoundingMode;
}

export type RoundingMode = 'none' | 'dezena' | 'centena';

export interface PricingResult {
  custoTotal: number;
  precoBase: number;
  precoFinal: number;
  lucroEstimado: number;
  valorHoraEfetivo: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams {
  column?: string;
  ascending?: boolean;
}

export interface FilterParams {
  [key: string]: unknown;
}

export interface QueryOptions extends PaginationParams, SortParams {
  filters?: FilterParams;
}

export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

export interface ListResult<T> extends ServiceResult<T[]> {
  count: number | null;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DashboardStats {
  totalClients: number;
  totalProposals: number;
  pendingProposals: number;
  acceptedValue: number;
  acceptanceRate: number;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: User;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date' | 'textarea';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

export interface DropdownItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  shortcut?: string;
}

export interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

export interface StatCardData {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
}

export interface QuickActionData {
  label: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
  color: string;
  bg: string;
}

export interface ProposalFormData {
  clienteId: string;
  itens: ProposalItem[];
  desconto: number;
  validade: string;
  condicoes?: string;
}

export interface ClientFormData {
  nome: string;
  email?: string;
  telefone?: string;
}

export interface ServiceFormData {
  nome: string;
  tipo: 'labor' | 'material';
  horas: number;
  valorHora: number;
  materiais: number;
}

// Form input types (without system fields)
export interface CreateClientInput {
  nome: string;
  email?: string;
  telefone?: string;
}

export interface UpdateClientInput {
  nome?: string;
  email?: string;
  telefone?: string;
}

export interface CreateProposalInput {
  clienteId: string;
  itens: ProposalItem[];
  desconto: number;
  validade: string;
  condicoes?: string;
  status: ProposalStatus;
}

export interface UpdateProposalInput {
  clienteId?: string;
  itens?: ProposalItem[];
  desconto?: number;
  validade?: string;
  condicoes?: string;
  status?: ProposalStatus;
}

export interface CreateServiceInput {
  nome: string;
  tipo: 'labor' | 'material';
  horas: number;
  valorHora: number;
  materiais: number;
}

export interface UpdateServiceInput {
  nome?: string;
  tipo?: 'labor' | 'material';
  horas?: number;
  valorHora?: number;
  materiais?: number;
}