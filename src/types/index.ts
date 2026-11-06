export interface Cliente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  created_at: string;
}

export type ProposalStatus = 'rascunho' | 'enviada' | 'aceita' | 'recusada' | 'expirada';

export interface ProposalItem {
  id: string;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
}

export interface Proposta {
  id: string;
  numero: string;
  clienteId: string;
  itens: ProposalItem[];
  desconto: number;
  validade: string;
  condicoes?: string;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

export interface ServiceTemplate {
  id: string;
  nome: string;
  horas: number;
  valorHora: number;
  materiais: number;
}




