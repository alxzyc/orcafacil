import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './Button';

const tabs = [
  { to: '/', label: 'Início', icon: '🏠' },
  { to: '/clientes', label: 'Clientes', icon: '👥' },
  { to: '/propostas', label: 'Propostas', icon: '📄' },
  { to: '/calcular', label: 'Preço', icon: '🧮' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#17151F]/90 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-md mx-auto flex justify-around items-center py-2">
        {tabs.map(t => {
          const active = location.pathname === t.to;
          return (
            <Link key={t.to} to={t.to} className={`flex flex-col items-center px-4 py-2 ${active ? 'text-white' : 'text-white/60'}`}>
              <span className="text-xl">{t.icon}</span>
              <span className="text-xs">{t.label}</span>
            </Link>
          );
        })}
        <div className="absolute -top-6">
          <Button className="rounded-full w-14 h-14 shadow-lg">+</Button>
        </div>
      </div>
    </div>
  );
};
