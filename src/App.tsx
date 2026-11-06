import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlassCard } from './components/GlassCard';
import { Button } from './components/Button';

const Home = () => (
  <div className="min-h-screen bg-[#0F0E17] text-white flex items-center justify-center">
    <GlassCard className="p-8 max-w-md w-full text-center">
      <h1 className="text-2xl font-bold mb-4">OrçaFácil</h1>
      <p className="text-white/70 mb-6">Sistema em construção. Navegação em progresso.</p>
      <Button>Começar</Button>
    </GlassCard>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
