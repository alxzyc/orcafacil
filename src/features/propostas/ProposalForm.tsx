import React, { useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { Proposta, ProposalItem } from '../../types';

export const ProposalForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [itens, setItens] = useState<ProposalItem[]>([{ id: '1', descricao: '', quantidade: 1, valorUnitario: 0 }]);

  const total = itens.reduce((s,i)=> s + i.quantidade * i.valorUnitario, 0);

  return (
    <div className="p-4 space-y-4 pb-24">
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">Nova proposta — Etapa {step+1}/3</h2>
        {step===0 && (
          <div className="space-y-3">
            <label>Cliente</label>
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2" placeholder="Selecione cliente"/>
          </div>
        )}
        {step===1 && (
          <div className="space-y-3">
            {itens.map((it, idx)=>(
              <div key={it.id} className="grid grid-cols-3 gap-2">
                <input value={it.descricao} onChange={e=>{const v=[...itens];v[idx].descricao=e.target.value;setItens(v)}} placeholder="Descrição" className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"/>
                <input type="number" value={it.quantidade} onChange={e=>{const v=[...itens];v[idx].quantidade=+e.target.value;setItens(v)}} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"/>
                <input type="number" value={it.valorUnitario} onChange={e=>{const v=[...itens];v[idx].valorUnitario=+e.target.value;setItens(v)}} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"/>
              </div>
            ))}
            <Button variant="secondary" onClick={()=>setItens([...itens,{id:Date.now().toString(),descricao:'',quantidade:1,valorUnitario:0}])}>Adicionar item</Button>
            <div className="text-right font-medium">Subtotal: {new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(total)}</div>
          </div>
        )}
        {step===2 && (
          <div className="space-y-3">
            <label>Validade</label>
            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"/>
            <label>Condições de pagamento</label>
            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"/>
          </div>
        )}
        <div className="flex justify-between mt-6">
          <Button variant="ghost" disabled={step===0} onClick={()=>setStep(s=>s-1)}>Voltar</Button>
          <Button onClick={()=>setStep(s=> Math.min(2,s+1))}>{step===2?'Finalizar':'Próximo'}</Button>
        </div>
      </GlassCard>
    </div>
  );
};
