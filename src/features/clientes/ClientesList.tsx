import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClients } from '../../hooks/useClients';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2, User, Mail, Phone, X, Check, Loader2, ChevronLeft, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import type { Cliente } from '../../types';

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

  // Debounce search
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
    new Date(dateString).toLocaleDateString('pt-BR');

  return (
    <div className="p-4 space-y-4">
      {/* Header with Search and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar clientes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all"
            aria-label="Buscar clientes"
          />
        </div>
        <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-2 whitespace-nowrap">
          <Plus className="w-5 h-5" />
          <span>Novo Cliente</span>
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <GlassCard className="p-4 border-red-500/20">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>Erro ao carregar clientes: {error.message}</p>
            <Button variant="ghost" size="sm" onClick={() => fetchClients({ page: 1 })}>
              Tentar novamente
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Client List */}
      <div className="space-y-3" role="list" aria-label="Lista de clientes">
        {isLoading && clients.length === 0 ? (
          // Initial loading skeletons
          <div className="space-y-3" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : clients.length === 0 ? (
          // Empty state
          <GlassCard className="p-8 text-center">
            <User className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum cliente encontrado</h3>
            <p className="text-white/60 mb-4">
              {debouncedQuery ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro cliente'}
            </p>
            <Button variant="primary" onClick={openCreateModal} className="flex items-center gap-2 mx-auto">
              <Plus className="w-5 h-5" />
              Adicionar Cliente
            </Button>
          </GlassCard>
        ) : (
          // Client list
          clients.map((client) => (
            <GlassCard
              key={client.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{client.nome}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-white/60 mt-1">
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
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(client.id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2" role="navigation" aria-label="Paginação">
          <Button
            variant="secondary"
            size="sm"
            onClick={prevPage}
            disabled={currentPage <= 1 || isLoading}
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-4 text-white/70">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={nextPage}
            disabled={currentPage >= totalPages || isLoading}
            aria-label="Próxima página"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Total count */}
      {totalCount !== null && totalCount > 0 && (
        <p className="text-center text-sm text-white/50">
          {totalCount} cliente{totalCount !== 1 ? 's' : ''} no total
        </p>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <GlassCard className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 id="modal-title" className="text-xl font-semibold">
                {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button
                onClick={closeModal}
                className="text-white/50 hover:text-white transition-colors p-1"
                aria-label="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(editingClient ? handleUpdateSubmit : handleCreateSubmit)} className="space-y-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-white/80 mb-2">
                  Nome <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('nome')}
                  id="nome"
                  type="text"
                  placeholder="Nome completo"
                  className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${errors.nome ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                  aria-invalid={errors.nome ? 'true' : 'false'}
                  aria-describedby={errors.nome ? 'nome-error' : undefined}
                />
                {errors.nome && (
                  <p id="nome-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.nome.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="cliente@email.com"
                  className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-white/80 mb-2">
                  Telefone
                </label>
                <input
                  {...register('telefone')}
                  id="telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${errors.telefone ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                  aria-invalid={errors.telefone ? 'true' : 'false'}
                  aria-describedby={errors.telefone ? 'telefone-error' : undefined}
                />
                {errors.telefone && (
                  <p id="telefone-error" className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" aria-hidden="true" />
                    {errors.telefone.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={closeModal} className="flex-1" disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" color="white" className="mr-2" />
                      Salvando...
                    </>
                  ) : editingClient ? (
                    'Atualizar'
                  ) : (
                    'Criar'
                  )}
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
};





