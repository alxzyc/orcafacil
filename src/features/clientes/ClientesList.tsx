import React, { useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { Cliente } from '../../types';

const mockClientes: Cliente[] = [
  { id: '1', nome: 'Ana Silva', email: 'ana@exemplo.com', telefone: '11999999999', created_at: new Date().toISOString() },
  { id: '2', nome: 'Carlos Mendes', email: 'carlos@exemplo.com', created_at: new Date().toISOString() },
];

export const ClientesList: React.FC = () => {
  const [clientes] = useState<Cliente[]>(mockClientes);
  const [query, setQuery] = useState('');

  const filtrados = clientes.filter(c => c.nome.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="p-4 space-y-4">
      <GlassCard className="p-4">
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Buscar cliente..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-white/40"
          />
          <Button variant="primary">Novo cliente</Button>
        </div>

        <div className="space-y-2">
          {filtrados.map(c => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between">
              <div>
                <div className="font-medium">{c.nome}</div>
                <div className="text-sm text-white/60">{c.email}</div>
              </div>
              <Button variant="ghost">Ver</Button>
            </div>
          ))}
          {filtrados.length === 0 && (
            <div className="text-center text-white/60 py-8">Nenhum cliente encontrado</div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
