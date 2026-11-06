import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlassCard } from './components/GlassCard';
import { Button } from './components/Button';
import { BottomNav } from './components/BottomNav';
import { ClientesList } from './features/clientes/ClientesList';
import { Calculadora } from './features/precificacao/Calculadora';

const Home = () => (
  <div className="min-h-screen bg-[#0F0E17] text-white pb-24">
    <div className="p-4 space-y-4">
      <GlassCard className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">OrçaFácil</h1>
        <p className="text-white/70">Dashboard em construção</p>
      </GlassCard>
      <GlassCard className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-xl p-4">Total faturado</div>
          <div className="bg-white/5 rounded-xl p-4">Propostas abertas</div>
          <div className="bg-white/5 rounded-xl p-4">Valor aceito</div>
          <div className="bg-white/5 rounded-xl p-4">Taxa aceitação</div>
        </div>
      </GlassCard>
    </div>
    <BottomNav />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clientes" element={
          <div className="min-h-screen bg-[#0F0E17] text-white pb-24">
            <ClientesList />
            <BottomNav />
          </div>
        } />
        <Route path="/calcular" element={
          <div className="min-h-screen bg-[#0F0E17] text-white">
            <Calculadora />
            <BottomNav />
          </div>
        } />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
