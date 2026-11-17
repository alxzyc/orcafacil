import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProposals } from '../../hooks/useProposals';
import { useClients } from '../../hooks/useClients';
import { useCatalog } from '../../hooks/useCatalog';
import { GlassCard, Button, Input, Label, Badge, Modal } from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, ArrowRight, Check, Loader2, FileText, User, Package, Calendar, CreditCard, X, AlertCircle, RotateCcw, DollarSign, Percent, GripVertical } from 'lucide-react';
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

  const { fields: itens, append, remove, move } = useFieldArray({ control, name: 'itens' });
  const values = watch();
  const clienteId = watch('clienteId');
  const selectedClient = clients.find(c => c.id === clienteId);

  const subtotal = values.itens.reduce((sum, item) => sum + (item.quantidade || 0) * (item.valorUnitario || 0), 0);
  const total = subtotal - (values.desconto || 0);

  useEffect(() => {
    fetchClients({ page: 1, pageSize: 100 });
    fetchByType('labor');
    fetchByType('material');
  }, [fetchClients, fetchByType]);

  useEffect(() => {
    if (isEditing && id) {
      // In a real app, you'd fetch the proposal here
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
      const step1Errors = step1Schema.safeParse({ clienteId: values.clienteId });
      if (!step1Errors.success) {
        toast.error('Selecione um cliente');
        return;
      }
    }
    if (step === 1) {
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

  const StepIndicator = ({ step: currentStep, totalSteps }: { step: number; totalSteps: number }) => (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        {steps.map((s, index) => (
          <React.Fragment key={s.label}>
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index < currentStep
                    ? 'bg-[var(--accent-lime)] text-black'
                    : index === currentStep
                    ? 'bg-[var(--bg-input)] text-white border border-[var(--accent-lime)]'
                    : 'bg-[var(--bg-input)] text-[var(--text-tertiary)]'
                }`}
              >
                {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className={`hidden sm:block text-sm font-medium ${index <= currentStep ? 'text-white' : 'text-[var(--text-tertiary)]'}`}>
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`hidden sm:block w-16 h-0.5 rounded mx-2 transition-colors ${
                  index < currentStep ? 'bg-[var(--accent-lime)]' : 'bg-[var(--border-default)]'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </GlassCard>
  );

  const ItemRow = ({ item, index, errors }: { item: any; index: number; errors: any; register: any }) => (
    <div key={item.id} className="grid grid-cols-12 gap-2 items-start p-4 bg-[var(--bg-input)] rounded-xl border border-[var(--border-default)]" role="listitem">
      <div className="col-span-12 sm:col-span-1 flex items-center">
        <GripVertical className="w-5 h-5 text-[var(--text-tertiary)] cursor-grab" aria-label="Reordenar item" />
      </div>
      <div className="col-span-12 sm:col-span-5">
        <Label htmlFor={`descricao-${index}`} className="sr-only">Descrição</Label>
        <Input
          {...register(`itens.${index}.descricao`)}
          id={`descricao-${index}`}
          placeholder="Ex: Desenvolvimento de site"
          error={errors.itens?.[index]?.descricao?.message}
        />
      </div>
      <div className="col-span-12 sm:col-span-2">
        <Label htmlFor={`quantidade-${index}`} className="sr-only">Quantidade</Label>
        <Input
          {...register(`itens.${index}.quantidade`, { valueAsNumber: true })}
          id={`quantidade-${index}`}
          type="number"
          min="1"
          step="1"
          error={errors.itens?.[index]?.quantidade?.message}
        />
      </div>
      <div className="col-span-12 sm:col-span-2">
        <Label htmlFor={`valorUnitario-${index}`} className="sr-only">Valor Unitário</Label>
        <Input
          {...register(`itens.${index}.valorUnitario`, { valueAsNumber: true })}
          id={`valorUnitario-${index}`}
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          error={errors.itens?.[index]?.valorUnitario?.message}
        />
      </div>
      <div className="col-span-12 sm:col-span-1 flex items-end">
        <p className="text-lg font-semibold text-[var(--accent-lime)] w-full sm:w-auto">
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
            className="text-[var(--error)] hover:bg-[var(--error-bg)] p-2"
            leftIcon={<Trash2 className="w-4 h-4" />}
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4 pb-28">
      <StepIndicator step={step} totalSteps={steps.length} />

      <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4" noValidate>
        {step === 0 && (
          <GlassCard className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Selecione o Cliente</h2>
              <p className="text-[var(--text-secondary)]">Escolha um cliente existente ou crie um novo</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="clienteId" required>Cliente</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" aria-hidden="true" />
                <select
                  {...register('clienteId')}
                  className="w-full pl-10 pr-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-lime)] focus:ring-opacity-50 focus:border-transparent transition-all appearance-none"
                  aria-invalid={errors.clienteId ? 'true' : 'false'}
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
                <p className="mt-1 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.clienteId.message}
                </p>
              )}

              <Button
                variant="secondary"
                type="button"
                onClick={() => setShowClientModal(true)}
                className="w-full sm:w-auto flex items-center gap-2"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Novo Cliente
              </Button>
            </div>

            {selectedClient && (
              <GlassCard variant="accent" className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--accent-lime)]/20">
                    <User className="w-5 h-5 text-[var(--accent-lime)]" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--accent-lime)]">{selectedClient.nome}</p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {selectedClient.email || 'Sem email'} • {selectedClient.telefone || 'Sem telefone'}
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}
          </GlassCard>
        )}

        {step === 1 && (
          <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Itens da Proposta</h2>
              <Button variant="secondary" type="button" onClick={handleAddItem} className="flex items-center gap-2" leftIcon={<Plus className="w-4 h-4" />}>
                Adicionar
              </Button>
            </div>

            {(laborItems.length > 0 || materialItems.length > 0) && (
              <div className="space-y-4">
                {laborItems.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Serviços (Mão de Obra)</h3>
                    <div className="flex flex-wrap gap-2">
                      {laborItems.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => applyCatalogItem(item)}
                          className="px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-secondary)] hover:border-[var(--accent-lime)] hover:bg-[var(--accent-lime)]/5 hover:text-[var(--accent-lime)] transition-all"
                        >
                          {item.nome} ({formatCurrency(item.valorHora)}/h)
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {materialItems.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Materiais</h3>
                    <div className="flex flex-wrap gap-2">
                      {materialItems.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => applyCatalogItem(item)}
                          className="px-3 py-1.5 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-lg text-sm text-[var(--text-secondary)] hover:border-[var(--accent-lime)] hover:bg-[var(--accent-lime)]/5 hover:text-[var(--accent-lime)] transition-all"
                        >
                          {item.nome} ({formatCurrency(item.materiais)})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3" role="list" aria-label="Itens da proposta">
              {itens.map((item, index) => (
                <ItemRow key={item.id} item={item} index={index} errors={errors} register={register} />
              ))}
            </div>

            <GlassCard variant="bordered" className="p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Subtotal ({itens.length} item{itens.length !== 1 ? 's' : ''})</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="mt-2">
                <Label htmlFor="desconto" className="block text-xs text-[var(--text-tertiary)] mb-1">Desconto (R$)</Label>
                <Input
                  {...register('desconto', { valueAsNumber: true })}
                  id="desconto"
                  type="number"
                  min="0"
                  max={subtotal}
                  step="0.01"
                  className="w-full sm:w-48"
                />
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--border-default)] flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-[var(--accent-lime)]">{formatCurrency(Math.max(0, total))}</span>
              </div>
            </GlassCard>
          </GlassCard>
        )}

        {step === 2 && (
          <GlassCard className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">Finalizar Proposta</h2>

            <div>
              <Label htmlFor="validade" required>Data de Validade</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" aria-hidden="true" />
                <Input
                  {...register('validade')}
                  id="validade"
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  error={errors.validade?.message}
                  className="pl-10"
                />
              </div>
              {errors.validade && (
                <p className="mt-1 text-sm text-[var(--error)] flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.validade.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="condicoes">Condições de Pagamento</Label>
              <textarea
                {...register('condicoes')}
                id="condicoes"
                rows={4}
                placeholder="Ex: 50% na assinatura, 50% na entrega. Pagamento via PIX ou transferência."
                className="w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-lime)] focus:ring-opacity-50 focus:border-transparent transition-all resize-none"
              />
            </div>

            <GlassCard variant="bordered" className="p-4">
              <h3 className="font-medium mb-3">Resumo</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Cliente</span>
                  <span className="font-medium">{selectedClient?.nome || 'Não selecionado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Itens</span>
                  <span className="font-medium">{itens.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Desconto</span>
                  <span className="font-medium text-[var(--error)]">-{formatCurrency(values.desconto || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-[var(--border-default)]">
                  <span>Total</span>
                  <span className="text-[var(--accent-lime)]">{formatCurrency(Math.max(0, total))}</span>
                </div>
              </div>
            </GlassCard>
          </GlassCard>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="ghost"
            type="button"
            onClick={handleBack}
            disabled={step === 0 || isSubmitting}
            className="flex items-center gap-2"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar
          </Button>
          <div className="flex gap-3">
            {step < 2 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex items-center gap-2"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Próximo
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex items-center gap-2 w-full sm:w-auto"
                leftIcon={<Save className="w-4 h-4" />}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Salvando...
                  </>
                ) : (
                  isEditing ? 'Atualizar' : 'Criar Proposta'
                )}
              </Button>
            )}
          </div>
        </div>
      </form>

      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title="Novo Cliente"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowClientModal(false)}>Cancelar</Button>
            <Button variant="primary" form="new-client-form" type="submit">Criar Cliente</Button>
          </div>
        }
      >
        <form id="new-client-form" className="space-y-4">
          <div>
            <Label htmlFor="nome" required>Nome</Label>
            <Input
              id="nome"
              type="text"
              placeholder="Nome completo"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="cliente@email.com"
            />
          </div>
          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              type="tel"
              placeholder="(11) 99999-9999"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProposalForm;