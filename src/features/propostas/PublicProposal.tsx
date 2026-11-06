import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { proposalService } from '../../services';
import { Button } from '../../components/Button';
import { GlassCard } from '../../components/GlassCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CheckCircle, XCircle, Download, Clock, AlertCircle, Share2, Loader2, Check, X, FileText } from 'lucide-react';
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
      // Fallback for older browsers
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
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Aceita' };
      case 'recusada':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Recusada' };
      case 'enviada':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Enviada' };
      case 'rascunho':
        return { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Rascunho' };
      case 'expirada':
        return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Expirada' };
      default:
        return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: status };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" color="primary" />
          <p className="mt-4 text-gray-600">Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <GlassCard className="w-full max-w-md p-8 text-center" style={{ background: 'rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.08)' }}>
          <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Proposta não encontrada</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Esta proposta não existe ou o link expirou.'}
          </p>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Voltar
          </Button>
        </GlassCard>
      </div>
    );
  }

  const { icon: StatusIcon, color, bg, label } = getStatusConfig(proposal.status);
  const total = getTotal(proposal);
  const isFinalized = proposal.status === 'aceita' || proposal.status === 'recusada';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-500 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">OrçaFácil</h1>
              <p className="text-sm text-gray-500">Proposta Comercial</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleShare} className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
            <Button variant="secondary" size="sm" onClick={handleExportPdf} disabled={actionLoading === 'pdf'} className="flex items-center gap-1">
              {actionLoading === 'pdf' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              PDF
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <div id="proposal-content" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Proposal Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-lime-100 text-lime-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-500" aria-hidden="true" />
                  {proposal.numero}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
                  <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                  {label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium text-gray-900">{proposal.clienteId || 'Cliente não informado'}</p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-sm text-gray-500">Validade</p>
                <p className="font-medium text-gray-900">{format(new Date(proposal.validade), 'dd/MM/yyyy', { locale: ptBR })}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="p-6 border-b border-gray-100">
            <table className="w-full" role="table">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 text-sm">Item</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 text-sm">Qtd</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Valor Unit.</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {proposal.itens.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900">{item.descricao}</p>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">{item.quantidade}</td>
                    <td className="py-4 px-4 text-right text-gray-600">{formatCurrency(item.valorUnitario)}</td>
                    <td className="py-4 px-4 text-right font-medium text-gray-900">
                      {formatCurrency(item.quantidade * item.valorUnitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex justify-end space-x-6 max-w-xs mx-auto sm:mx-0">
              <div className="text-right">
                <p className="text-sm text-gray-500">Subtotal</p>
                <p className="font-medium text-gray-900">{formatCurrency(total + (proposal.desconto || 0))}</p>
              </div>
              {(proposal.desconto || 0) > 0 && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Desconto</p>
                  <p className="font-medium text-red-500">-{formatCurrency(proposal.desconto || 0)}</p>
                </div>
              )}
              <div className="text-right border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-lime-600">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {/* Conditions */}
          {proposal.condicoes && (
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-2">Condições de Pagamento</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{proposal.condicoes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 border-t border-gray-100 bg-white">
            {isFinalized ? (
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bg} ${color}`}>
                  <StatusIcon className="w-5 h-5" aria-hidden="true" />
                  <span className="font-medium">Esta proposta foi {label.toLowerCase()}</span>
                </div>
                <p className="mt-3 text-sm text-gray-500">
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
                >
                  {actionLoading === 'reject' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Recusando...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Recusar
                    </>
                  )}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAccept}
                  disabled={actionLoading !== null}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {actionLoading === 'accept' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Aceitando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Aceitar Proposta
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Documento gerado pelo OrçaFácil</p>
          <p className="mt-1">Proposta válida até {format(new Date(proposal.validade), 'dd/MM/yyyy', { locale: ptBR })}</p>
        </div>
      </main>
    </div>
  );
};



