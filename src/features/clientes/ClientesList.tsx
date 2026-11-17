import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClients } from '../../hooks/useClients';
import { GlassCard, Button, Input, Label, Badge, Modal, Avatar } from '../../components';
import { LoadingSpinner, SkeletonCard } from '../../components/LoadingSpinner';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2, User, Mail, Phone, X, Check, Loader2, ChevronLeft, ChevronRight, AlertCircle, Clock, UserPlus } from 'lucide-react';
import type { Cliente, ClientFormData } from '../../types';

const clientSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

export const ClientesList: React.FC = () => {
  const {
    clients,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    searchClients,
    goToPage,
    nextPage,
    prevPage,
  } = useClients();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ClientForm>({
    resolver: zodResolver(clientSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      searchClients(query, { page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchClients]);

  const handleCreateSubmit = async (data: ClientForm) => {
    setIsSubmitting(true);
    try {
      const result = await createClient({
        nome: data.nome,
        email: data.email || undefined,
        telefone: data.telefone || undefined,
      });
      if (result.success) {
        toast.success('Cliente criado com sucesso!');
        closeModal();
      } else {
        toast.error(result.error?.message || 'Erro ao criar cliente');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (data: ClientForm) => {
    if (!editingClient) return;
    setIsSubmitting(true);
    try {
      const result = await updateClient(editingClient.id, {
        nome: data.nome,
        email: data.email || undefined,
        telefone: data.telefone || undefined,
      });
      if (result.success) {
        toast.success('Cliente atualizado com sucesso!');
        closeModal();
      } else {
        toast.error(result.error?.message || 'Erro ao atualizar cliente');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteClient(id);
      if (result.success) {
        toast.success('Cliente excluído!');
      } else {
        toast.error(result.error?.message || 'Erro ao excluir cliente');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    reset({ nome: '', email: '', telefone: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (client: Cliente) => {
    setEditingClient(client);
    reset({
      nome: client.nome,
      email: client.email || '',
      telefone: client.telefone || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    reset();
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const confirmDelete = (id: string, nome: string) => (
    <Modal
      isOpen={deletingId === id}
      onClose={() => setDeletingId(null)}
      title="Excluir cliente"
      description={`Tem certeza que deseja excluir "${nome}"? Esta ação não pode ser desfeita.`}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeletingId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={() => handleDelete(id)} loading={deletingId === id}>
            Excluir
          </Button>
        </div>
      }
    >
      <div />
    </Modal>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-[var(--accent-lime)]" />
            Clientes
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Gerencie seus clientes</p>
        </div>
        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-2 whitespace-nowrap" leftIcon={<UserPlus className="w-5 h-5" />}>
          Novo Cliente
        </Button>
      </div>

      <GlassCard className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" aria-hidden="true" />
          <Input
            type="text"
            placeholder="Buscar clientes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            aria-label="Buscar clientes"
          />
        </div>
      </GlassCard>

      {error && (
        <GlassCard variant="bordered" className="p-4 border-[var(--error-border)]">
          <div className="flex items-center gap-3 text-[var(--error-text)]">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Erro ao carregar clientes: {error.message}</p>
            <Button variant="ghost" size="sm" onClick={() => fetchClients({ page: 1 })}>
              Tentar novamente
            </Button>
          </div>
        </GlassCard>
      )}

      <div className="space-y-3" role="list" aria-label="Lista de clientes">
        {isLoading && clients.length === 0 ? (
          <div className="space-y-3" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : clients.length === 0 ? (
          <GlassCard className="p-10 text-center">
            <User className="w-16 h-16 mx-auto text-[var(--text-tertiary)] mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {debouncedQuery ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro cliente'}
            </p>
            <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-2 mx-auto" leftIcon={<Plus className="w-5 h-5" />}>
              Adicionar Cliente
            </Button>
          </GlassCard>
        ) : (
          clients.map((client) => (
            <GlassCard
              key={client.id}
              variant="interactive"
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Avatar
                  fallback={client.nome}
                  alt={client.nome}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="font-medium truncate">{client.nome}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)] mt-1">
                    {client.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                        {client.email}
                      </span>
                    )}
                    {client.telefone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                        {client.telefone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      {formatDate(client.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(client)}
                  aria-label={`Editar ${client.nome}`}
                  disabled={isSubmitting}
                  leftIcon={<Edit className="w-4 h-4" />}
                />
                {confirmDelete(client.id, client.nome)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(client.id)}
                  aria-label={`Excluir ${client.nome}`}
                  disabled={deletingId === client.id || isSubmitting}
                >
                  {deletingId === client.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2" role="navigation" aria-label="Paginação">
<Button
                  variant="secondary"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage <= 1 || isLoading}
                  aria-label="Página anterior"
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                />
          <span className="px-4 text-[var(--text-secondary)]">
            Página {currentPage} de {totalPages}
          </span>
<Button
              variant="secondary"
              size="sm"
              onClick={nextPage}
              disabled={currentPage >= totalPages || isLoading}
              aria-label="Próxima página"
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Próxima
            </Button>
        </div>
      )}

      {totalCount !== null && totalCount > 0 && (
        <p className="text-center text-sm text-[var(--text-tertiary)]">
          {totalCount} cliente{totalCount !== 1 ? 's' : ''} no total
        </p>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => {}}
              form="client-form"
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {editingClient ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        }
      >
        <form id="client-form" onSubmit={handleSubmit(editingClient ? handleUpdateSubmit : handleCreateSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nome" required>Nome</Label>
            <Input
              {...register('nome')}
              id="nome"
              type="text"
              placeholder="Nome completo"
              error={errors.nome?.message}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              {...register('email')}
              id="email"
              type="email"
              placeholder="cliente@email.com"
              error={errors.email?.message}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              {...register('telefone')}
              id="telefone"
              type="tel"
              placeholder="(11) 99999-9999"
              error={errors.telefone?.message}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientesList;