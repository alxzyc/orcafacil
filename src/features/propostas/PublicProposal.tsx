import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '../../components/Button';

const mock = {
  numero: 'ORC-2026-0001',
  cliente: 'Ana Silva',
  itens: [
    { descricao: 'Site institucional', quantidade: 1, valorUnitario: 2500 },
    { descricao: 'Manutenção mensal', quantidade: 3, valorUnitario: 300 },
  ],
  validade: '2026-12-31',
  total: 3400
};

export const PublicProposal: React.FC = () => {
  const exportPdf = async () => {
    const el = document.getElementById('proposal-content');
    if (!el) return;
    const canvas = await html2canvas(el);
    const pdf = new jsPDF('p','mm','a4');
    const imgData = canvas.toDataURL('image/png');
    const width = 210;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData,'PNG',10,10,width,height);
    pdf.save(`${mock.numero}.pdf`);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 max-w-3xl mx-auto">
      <div id="proposal-content" className="space-y-4">
        <h1 className="text-2xl font-bold">OrçaFácil</h1>
        <div>Proposta {mock.numero}</div>
        <div>Cliente: {mock.cliente}</div>
        <table className="w-full border">
          <thead><tr className="border-b"><th className="text-left p-2">Item</th><th className="text-left p-2">Qtd</th><th className="text-left p-2">Valor</th></tr></thead>
          <tbody>
            {mock.itens.map((i,idx)=>(
              <tr key={idx} className="border-b">
                <td className="p-2">{i.descricao}</td>
                <td className="p-2">{i.quantidade}</td>
                <td className="p-2">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(i.valorUnitario)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-right font-bold">Total: {new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(mock.total)}</div>
        <div>Validade: {mock.validade}</div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="primary">Aceitar</Button>
        <Button variant="danger">Recusar</Button>
        <Button variant="secondary" onClick={exportPdf}>Exportar PDF</Button>
      </div>
    </div>
  );
};
