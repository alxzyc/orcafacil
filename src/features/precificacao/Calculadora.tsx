import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
import { calcularPreco, RoundingMode } from '../../lib/pricing';

const schema = z.object({
  horas: z.number().min(0),
  valorHora: z.number().min(0),
  materiais: z.number().min(0),
  margem: z.number().min(0).max(100),
  impostos: z.number().min(0).max(100),
  rounding: z.enum(['none','dezena','centena'])
});

type Form = z.infer<typeof schema>;

export const Calculadora: React.FC = () => {
  const { register, watch } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { horas: 10, valorHora: 150, materiais: 200, margem: 30, impostos: 10, rounding: 'none' }
  });

  const values = watch();
  const resultado = calcularPreco({
    horas: values.horas,
    valorHora: values.valorHora,
    materiais: values.materiais,
    margem: values.margem,
    impostos: values.impostos,
    rounding: values.rounding as RoundingMode
  });

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

  return (
    <div className="p-4 space-y-4 pb-24">
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">Calculadora de preço</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['horas','Horas estimadas'],
            ['valorHora','Custo por hora'],
            ['materiais','Materiais R$'],
            ['margem','Margem %'],
            ['impostos','Impostos %']
          ].map(([name,label]) => (
            <label key={name} className="block">
              <span className="text-sm text-white/70">{label}</span>
              <input {...register(name as any, { valueAsNumber: true })} type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 mt-1"/>
            </label>
          ))}
          <label className="block col-span-2">
            <span className="text-sm text-white/70">Arredondamento</span>
            <select {...register('rounding')} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 mt-1">
              <option value="none">Sem arredondamento</option>
              <option value="dezena">Dezena</option>
              <option value="centena">Centena</option>
            </select>
          </label>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="space-y-2 text-sm">
          <div>Custo total: {fmt(resultado.custoTotal)}</div>
          <div>Preço base: {fmt(resultado.precoBase)}</div>
          <div className="text-xl font-bold">Preço final: {fmt(resultado.precoFinal)}</div>
          <div>Lucro estimado: {fmt(resultado.lucroEstimado)}</div>
          <div>Valor hora efetivo: {fmt(resultado.valorHoraEfetivo)}</div>
        </div>
        <Button className="mt-4 w-full">Salvar como serviço</Button>
      </GlassCard>
    </div>
  );
};
