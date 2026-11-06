import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProposals } from '../../hooks/useProposals';
import { useClients } from '../../hooks/useClients';
import { useCatalog } from '../../hooks/useCatalog';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Check, Loader2, FileText, User, Package, Calendar, CreditCard, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Proposta, ProposalItem, Cliente, ServiceTemplate } from '../../types';

const itemSchema = z.object({
  id: z.string().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade: z.number().min(1, 'Quantidade deve ser pelo menos 1'),
  valorUnitario: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
});

const step1Schema = z.object({
  clienteId: z.string().min(1, 'Selecione um cliente'),
});

const step3Schema = z.object({
  validade: z.string().min(1, 'Data de validade é obrigatória'),
  condicoes: z.string().optional(),
});

const proposalSchema = z.object({
  clienteId: z.string().min(1, 'Selecione um cliente'),
  itens: z.array(itemSchema).min(1, 'Adicione pelo menos um item'),
  desconto: z.number().min(0).default(0),
  validade: z.string().min(1, 'Data de validade é obrigatória'),
  condicoes: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;
type ProposalSubmitData = Omit<ProposalFormData, 'desconto'> & { desconto?: number };

export const ProposalForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const { createProposal, updateProposal, fetchProposals } = useProposals();
  const { clients, fetchClients, isLoading: clientsLoading } = useClients();
  const { laborItems, materialItems, fetchByType } = useCatalog();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<ProposalSubmitData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      clienteId: '',
      itens: [{ descricao: '', quantidade: 1, valorUnitario: 0 }],
      desconto: 0,
      validade: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      condicoes: '',
    },
    mode: 'onChange',
  });

  const { fields: itens, append, remove } = useFieldArray({ control, name: 'itens' });
  const values = watch();
  const clienteId = watch('clienteId');
  const selectedClient = clients.find(c => c.id === clienteId);

  const subtotal = values.itens.reduce((sum, item) => sum + (item.quantidade || 0) * (item.valorUnitario || 0), 0);
  const total = subtotal - (values.desconto || 0);

  // Load data on mount
  useEffect(() => {
    fetchClients({ page: 1, pageSize: 100 });
    fetchByType('labor');
    fetchByType('material');
  }, [fetchClients, fetchByType]);

  // Load proposal if editing
  useEffect(() => {
    if (isEditing && id) {
      // In a real app, you'd fetch the proposal here
      // For now, we'll just use the form as-is
    }
  }, [isEditing, id]);

  const handleAddItem = () => {
    append({ descricao: '', quantidade: 1, valorUnitario: 0 });
  };

  const handleRemoveItem = (index: number) => {
    if (itens.length <= 1) {
      toast.error('A proposta deve ter pelo menos um item');
      return;
    }
    remove(index);
  };

  const applyCatalogItem = (item: ServiceTemplate) => {
    const newItem: ProposalItem = {
      id: crypto.randomUUID(),
      descricao: item.nome,
      quantidade: 1,
      valorUnitario: item.horas > 0 ? item.valorHora : item.materiais,
    };
    append(newItem);
    setStep(1);
    toast.success(`Item "${item.nome}" adicionado`);
  };

  const handleNext = () => {
    if (step === 0) {
      // Validate step 1
      const step1Errors = step1Schema.safeParse({ clienteId: values.clienteId });
      if (!step1Errors.success) {
        toast.error('Selecione um cliente');
        return;
      }
    }
    if (step === 1) {
      // Validate step 2
      if (values.itens.length === 0) {
        toast.error('Adicione pelo menos um item');
        return;
      }
      const hasInvalidItems = values.itens.some(item =>
        !item.descricao || item.quantidade < 1 || item.valorUnitario < 0
      );
      if (hasInvalidItems) {
        toast.error('Preencha todos os itens corretamente');
        return;
      }
    }
    setStep(s => Math.min(2, s + 1));
  };

  const handleBack = () => {
    setStep(s => Math.max(0, s - 1));
  };

  const handleSubmitForm = async (data: ProposalSubmitData) => {
    setIsSubmitting(true);
    try {
      // Ensure each item has an id
      const itensWithIds = data.itens.map(item => ({
        ...item,
        id: item.id || crypto.randomUUID(),
      }));

      const proposalData = {
        clienteId: data.clienteId,
        itens: itensWithIds,
        desconto: data.desconto ?? 0,
        validade: data.validade,
        condicoes: data.condicoes,
        status: 'rascunho' as const,
      };

      let result;
      if (isEditing && id) {
        result = await updateProposal(id, proposalData);
      } else {
        result = await createProposal(proposalData);
      }

      if (result.success) {
        toast.success(isEditing ? 'Proposta atualizada!' : 'Proposta criada!');
        fetchProposals();
        navigate('/propostas');
      } else {
        toast.error(result.error?.message || 'Erro ao salvar proposta');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const steps = [
    { label: 'Cliente', icon: User },
    { label: 'Itens', icon: Package },
    { label: 'Finalizar', icon: FileText },
  ];

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Progress Steps */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => (
            <React.Fragment key={s.label}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    index < step
                      ? 'bg-accent-lime text-black'
                      : index === step
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {index < step ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`hidden sm:block text-sm font-medium ${index <= step ? 'text-white' : 'text-white/50'}`}>
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:block w-16 h-0.5 rounded mx-2 transition-colors ${
                    index < step ? 'bg-accent-lime' : 'bg-white/10'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </GlassCard>

      {/* Form Content */}
      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
        {/* Step 1: Client Selection */}
        {step === 0 && (
          <GlassCard className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Selecione o Cliente</h2>
              <p className="text-white/60">Escolha um cliente existente ou crie um novo</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Cliente <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" aria-hidden="true" />
                <select
                  {...register('clienteId')}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all appearance-none ${errors.clienteId ? 'border-red-500' : ''}`}
                  aria-invalid={errors.clienteId ? 'true' : 'false'}
                  aria-describedby={errors.clienteId ? 'cliente-error' : undefined}
                >
                  <option value="">Selecione um cliente</option>
                  {clientsLoading ? (
                    <option disabled>Carregando...</option>
                  ) : clients.length === 0 ? (
                    <option disabled>Nenhum cliente cadastrado</option>
                  ) : (
                    clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.nome} {client.email && `(${client.email})`}
                      </option>
                    ))
                  )}
                </select>
              </div>
              {errors.clienteId && (
                <p id="cliente-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.clienteId.message}
                </p>
              )}

              <Button
                variant="secondary"
                type="button"
                onClick={() => setShowClientModal(true)}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Cliente
              </Button>
            </div>

            {selectedClient && (
              <GlassCard className="p-4 bg-green-500/10 border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <User className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-green-300">{selectedClient.nome}</p>
                    <p className="text-sm text-green-400/80">
                      {selectedClient.email || 'Sem email'} • {selectedClient.telefone || 'Sem telefone'}
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}
          </GlassCard>
        )}

        {/* Step 2: Items */}
        {step === 1 && (
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Itens da Proposta</h2>
              <Button variant="secondary" type="button" onClick={handleAddItem} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>

            {/* Catalog Quick Add */}
            {(laborItems.length > 0 || materialItems.length > 0) && (
              <div className="space-y-4">
                {laborItems.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-white/70 mb-2">Serviços (Mão de Obra)</h3>
                    <div className="flex flex-wrap gap-2">
                      {laborItems.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => applyCatalogItem(item)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 hover:border-accent-lime/50 hover:bg-accent-lime/5 hover:text-accent-lime transition-all"
                        >
                          {item.nome} ({formatCurrency(item.valorHora)}/h)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {materialItems.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-white/70 mb-2">Materiais</h3>
                    <div className="flex flex-wrap gap-2">
                      {materialItems.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => applyCatalogItem(item)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80 hover:border-accent-lime/50 hover:bg-accent-lime/5 hover:text-accent-lime transition-all"
                        >
                          {item.nome} ({formatCurrency(item.materiais)})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3" role="list" aria-label="Itens da proposta">
              {itens.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-4 bg-white/5 rounded-xl border border-white/10" role="listitem">
                  <div className="col-span-12 sm:col-span-6">
                    <label className="block text-xs text-white/50 mb-1">Descrição</label>
                    <input
                      {...register(`itens.${index}.descricao`)}
                      placeholder="Ex: Desenvolvimento de site"
                      className={`w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent ${errors.itens?.[index]?.descricao ? 'border-red-500' : ''}`}
                    />
                    {errors.itens?.[index]?.descricao && (
                      <p className="mt-1 text-xs text-red-400">{errors.itens[index].descricao.message}</p>
                    )}
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <label className="block text-xs text-white/50 mb-1">Qtd</label>
                    <input
                      {...register(`itens.${index}.quantidade`, { valueAsNumber: true })}
                      type="number"
                      min="1"
                      step="1"
                      className={`w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent ${errors.itens?.[index]?.quantidade ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <label className="block text-xs text-white/50 mb-1">Valor Unit. (R$)</label>
                    <input
                      {...register(`itens.${index}.valorUnitario`, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      step="0.01"
                      className={`w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent ${errors.itens?.[index]?.valorUnitario ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-2 flex items-end">
                    <p className="text-lg font-semibold text-accent-lime w-full sm:w-auto">
                      {formatCurrency((item.quantidade || 0) * (item.valorUnitario || 0))}
                    </p>
                  </div>
                  <div className="col-span-12 sm:col-span-1 flex items-end justify-end">
                    {itens.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        aria-label={`Remover item ${index + 1}`}
                        className="text-red-400 hover:bg-red-500/10 p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Subtotal ({itens.length} item{itens.length !== 1 ? 's' : ''})</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2">
                <label className="block text-xs text-white/50 mb-1">Desconto (R$)</label>
                <input
                  {...register('desconto', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  max={subtotal}
                  step="0.01"
                  className="w-full sm:w-48 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent"
                />
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-accent-lime">{formatCurrency(Math.max(0, total))}</span>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Step 3: Finalize */}
        {step === 2 && (
          <GlassCard className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">Finalizar Proposta</h2>

            <div>
              <label htmlFor="validade" className="block text-sm font-medium text-white/80 mb-2">
                Data de Validade <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" aria-hidden="true" />
                <input
                  {...register('validade')}
                  id="validade"
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${errors.validade ? 'border-red-500' : ''}`}
                  aria-invalid={errors.validade ? 'true' : 'false'}
                  aria-describedby={errors.validade ? 'validade-error' : undefined}
                />
              </div>
              {errors.validade && (
                <p id="validade-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.validade.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="condicoes" className="block text-sm font-medium text-white/80 mb-2">
                Condições de Pagamento
              </label>
              <textarea
                {...register('condicoes')}
                id="condicoes"
                rows={4}
                placeholder="Ex: 50% na assinatura, 50% na entrega. Pagamento via PIX ou transferência."
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all resize-none ${errors.condicoes ? 'border-red-500' : ''}`}
              />
            </div>

            {/* Summary */}
            <GlassCard className="p-4 bg-white/5">
              <h3 className="font-medium mb-3">Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Cliente</span>
                  <span className="font-medium">{selectedClient?.nome || 'Não selecionado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Itens</span>
                  <span className="font-medium">{itens.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Desconto</span>
                  <span className="font-medium">-{formatCurrency(values.desconto || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="text-accent-lime">{formatCurrency(Math.max(0, total))}</span>
                </div>
              </div>
            </GlassCard>
          </GlassCard>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button
            variant="ghost"
            type="button"
            onClick={handleBack}
            disabled={step === 0 || isSubmitting}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex gap-3">
            {step < 2 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                Próximo
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Atualizar' : 'Criar Proposta'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* New Client Modal */}
      {showClientModal && (
        <NewClientModal
          onClose={() => setShowClientModal(false)}
          onSuccess={() => {
            setShowClientModal(false);
            fetchClients({ page: 1, pageSize: 100 });
          }}
        />
      )}
    </div>
  );
};

// New Client Modal Component
interface NewClientModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const NewClientModal: React.FC<NewClientModalProps> = ({ onClose, onSuccess }) => {
  const { createClient } = useClients();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    nome: string;
    email: string;
    telefone: string;
  }>({
    defaultValues: { nome: '', email: '', telefone: '' },
  });

  const handleSubmitForm = async (data: { nome: string; email: string; telefone: string }) => {
    setIsSubmitting(true);
    try {
      const result = await createClient({
        nome: data.nome,
        email: data.email || undefined,
        telefone: data.telefone || undefined,
      });
      if (result.success) {
        toast.success('Cliente criado!');
        reset();
        onSuccess();
        onClose();
      } else {
        toast.error(result.error?.message || 'Erro ao criar cliente');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-client-title"
    >
      <GlassCard className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 id="new-client-title" className="text-xl font-semibold">Novo Cliente</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-white/80 mb-2">
              Nome <span className="text-red-400">*</span>
            </label>
            <input
              {...register('nome', { required: 'Nome é obrigatório' })}
              id="nome"
              type="text"
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent ${errors.nome ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.nome && <p className="mt-1 text-sm text-red-400">{errors.nome.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">Email</label>
            <input
              {...register('email', { pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Email inválido' } })}
              id="email"
              type="email"
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent ${errors.email ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-white/80 mb-2">Telefone</label>
            <input
              {...register('telefone')}
              id="telefone"
              type="tel"
              className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent ${errors.telefone ? 'border-red-500' : ''}`}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" className="mr-2" />
                  Criando...
                </>
              ) : (
                'Criar Cliente'
              )}
            </Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};



