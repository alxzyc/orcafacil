import React from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';

const mock = [
  { id: '1', numero: 'ORC-2026-0001', cliente: 'Ana Silva', status: 'enviada', total: 1250 },
  { id: '2', numero: 'ORC-2026-0002', cliente: 'Carlos Mendes', status: 'rascunho', total: 890 },
];

export const PropostasList: React.FC = () => (
  <div className="p-4 space-y-3 pb-24">
    {mock.map(p => (
      <GlassCard key={p.id} className="p-4 flex justify-between items-center">
        <div>
          <div className="font-medium">{p.numero} — {p.cliente}</div>
          <div className="text-sm text-white/60 capitalize">{p.status}</div>
        </div>
        <Button variant="ghost">Abrir</Button>
      </GlassCard>
    ))}
  </div>
);
