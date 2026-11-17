import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { proposalService } from '../../services';
import { Button, GlassCard, Badge } from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CheckCircle, XCircle, Download, Clock, AlertCircle, Share2, Loader2, Check, X, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Proposta } from '../../types';

export const PublicProposal: React.FC = () => {
  const { token } = useParams<{ token?: string }>();
  const [proposal, setProposal] = useState<Proposta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'accept' | 'reject' | 'pdf' | null>(null);

  useEffect(() => {
    if (token) {
      loadProposal();
    }
  }, [token]);

  const loadProposal = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await proposalService.getByPublicToken(token!);
      if (result.success && result.data) {
        setProposal(result.data);
      } else {
        setError('Proposta não encontrada ou link inválido');
      }
    } catch (err) {
      setError('Erro ao carregar proposta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token) return;
    setActionLoading('accept');
    try {
      const result = await proposalService.acceptByToken(token);
      if (result.success && result.data) {
        setProposal(result.data);
        toast.success('Proposta aceita com sucesso!');
      } else {
        toast.error(result.error?.message || 'Erro ao aceitar');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!token) return;
    setActionLoading('reject');
    try {
      const result = await proposalService.rejectByToken(token);
      if (result.success && result.data) {
        setProposal(result.data);
        toast.success('Proposta recusada');
      } else {
        toast.error(result.error?.message || 'Erro ao recusar');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportPdf = async () => {
    setActionLoading('pdf');
    try {
      const element = document.getElementById('proposal-content');
      if (!element) {
        toast.error('Conteúdo não encontrado');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight);
      pdf.save(`${proposal?.numero || 'proposta'}.pdf`);

      toast.success('PDF gerado com sucesso!');
    } catch (err) {
      toast.error('Erro ao gerar PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = async () => {
    if (!token) return;
    const url = `${window.location.origin}/p/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copiado!');
    } catch {
      prompt('Copie o link:', url);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getTotal = (p: Proposta) =>
    p.itens.reduce((sum, item) => sum + item.quantidade * item.valorUnitario, 0);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'aceita':
        return { icon: CheckCircle, color: 'text-[var(--success-text)]', bg: 'bg-[var(--success-bg)]', label: 'Aceita', variant: 'success' as const };
      case 'recusada':
        return { icon: XCircle, color: 'text-[var(--error-text)]', bg: 'bg-[var(--error-bg)]', label: 'Recusada', variant: 'error' as const };
      case 'enviada':
        return { icon: Clock, color: 'text-[var(--warning-text)]', bg: 'bg-[var(--warning-bg)]', label: 'Enviada', variant: 'warning' as const };
      case 'rascunho':
        return { icon: AlertCircle, color: 'text-[var(--info-text)]', bg: 'bg-[var(--info-bg)]', label: 'Rascunho', variant: 'info' as const };
      case 'expirada':
        return { icon: AlertCircle, color: 'text-[var(--warning-text)]', bg: 'bg-[var(--warning-bg)]', label: 'Expirada', variant: 'warning' as const };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: status, variant: 'neutral' as const };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="accent" />
          <p className="mt-4 text-[var(--text-secondary)]">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-6">
        <GlassCard variant="elevated" className="w-full max-w-md p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-[var(--error)] mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Proposta não encontrada</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            {error || 'Esta proposta não existe ou o link expirou.'}
          </p>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Voltar
          </Button>
        </GlassCard>
      </div>
    );
  }

  const { icon: StatusIcon, variant, label } = getStatusConfig(proposal.status);
  const total = getTotal(proposal);
  const isFinalized = proposal.status === 'aceita' || proposal.status === 'recusada';

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-default)] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--accent-lime)] rounded-xl">
              <FileText className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-white">OrçaFácil</h1>
              <p className="text-sm text-[var(--text-secondary)]">Proposta Comercial</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleShare} className="flex items-center gap-1" leftIcon={<Share2 className="w-4 h-4" />}>
              Compartilhar
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportPdf} disabled={actionLoading === 'pdf'} className="flex items-center gap-1" leftIcon={actionLoading === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}>
              PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div id="proposal-content" className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] overflow-hidden">
          <div className="p-6 border-b border-[var(--border-default)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <Badge variant="accent" icon={<span className="w-1.5 h-1.5 rounded-full bg-black" aria-hidden="true" />}>
                  {proposal.numero}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={variant} icon={<StatusIcon className="w-3.5 h-3.5" />}>
                  {label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Cliente</p>
                <p className="font-medium text-white">{proposal.clienteId || 'Cliente não informado'}</p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-sm text-[var(--text-secondary)]">Validade</p>
                <p className="font-medium text-white">{format(new Date(proposal.validade), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-[var(--border-default)]">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-[var(--border-default)]">
                  <th className="text-left py-3 px-4 font-medium text-[var(--text-secondary)] text-sm">Item</th>
                  <th className="text-center py-3 px-4 font-medium text-[var(--text-secondary)] text-sm">Qtd</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-secondary)] text-sm">Valor Unit.</th>
                  <th className="text-right py-3 px-4 font-medium text-[var(--text-secondary)] text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {proposal.itens.map((item, index) => (
                  <tr key={index} className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-input)]">
                    <td className="py-4 px-4">
                      <p className="font-medium text-white">{item.descricao}</p>
                    </td>
                    <td className="py-4 px-4 text-center text-[var(--text-secondary)]">{item.quantidade}</td>
                    <td className="py-4 px-4 text-right text-[var(--text-secondary)]">{formatCurrency(item.valorUnitario)}</td>
                    <td className="py-4 px-4 text-right font-medium text-white">
                      {formatCurrency(item.quantidade * item.valorUnitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-[var(--bg-input)] border-t border-[var(--border-default)]">
            <div className="flex justify-end space-x-6 max-w-xs mx-auto sm:mx-0">
              <div className="text-right">
                <p className="text-sm text-[var(--text-secondary)]">Subtotal</p>
                <p className="font-medium text-white">{formatCurrency(total + (proposal.desconto || 0))}</p>
              </div>
              {(proposal.desconto || 0) > 0 && (
                <div className="text-right">
                  <p className="text-sm text-[var(--text-secondary)]">Desconto</p>
                  <p className="font-medium text-[var(--error)]">-{formatCurrency(proposal.desconto || 0)}</p>
                </div>
              )}
              <div className="text-right border-t border-[var(--border-default)] pt-3">
                <p className="text-sm text-[var(--text-secondary)]">Total</p>
                <p className="text-2xl font-bold text-[var(--accent-lime)]">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {proposal.condicoes && (
            <div className="p-6 border-t border-[var(--border-default)] bg-[var(--bg-input)]">
              <h3 className="font-medium text-white mb-2">Condições de Pagamento</h3>
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{proposal.condicoes}</p>
            </div>
          )}

          <div className="p-6 border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
            {isFinalized ? (
              <div className="text-center">
                <Badge variant={variant} className="text-base px-4 py-2" icon={<StatusIcon className="w-5 h-5" />}>
                  Esta proposta foi {label.toLowerCase()}
                </Badge>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  {proposal.status === 'aceita'
                    ? 'Obrigado por aceitar nossa proposta! Entraremos em contato em breve.'
                    : 'Agradecemos seu tempo. Estamos à disposição para esclarecimentos.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={actionLoading !== null}
                  className="flex-1 flex items-center justify-center gap-2"
                  leftIcon={actionLoading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                >
                  {actionLoading === 'reject' ? 'Recusando...' : 'Recusar'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAccept}
                  disabled={actionLoading !== null}
                  className="flex-1 flex items-center justify-center gap-2"
                  leftIcon={actionLoading === 'accept' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                >
                  {actionLoading === 'accept' ? 'Aceitando...' : 'Aceitar Proposta'}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-[var(--text-tertiary)]">
          <p>Documento gerado pelo OrçaFácil</p>
          <p className="mt-1">Proposta válida até {format(new Date(proposal.validade), 'dd/MM/yyyy', { locale: ptBR })}</p>
        </div>
      </main>
    </div>
  );
};

export default PublicProposal;