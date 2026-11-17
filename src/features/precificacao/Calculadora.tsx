import React, { useState } from 'react';
import { useForm, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GlassCard, Button, Input, Select, Label, Badge } from '../../components';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { toast } from 'sonner';
import { Calculator, Save, TrendingUp, DollarSign, Percent, RotateCcw, Copy, Check, AlertCircle } from 'lucide-react';
import { calcularPreco, type RoundingMode } from '../../lib/pricing';
import { useCatalog } from '../../hooks/useCatalog';

const schema = z.object({
  horas: z.number().min(0, 'Horas deve ser maior ou igual a 0'),
  valorHora: z.number().min(0, 'Valor/hora deve ser maior ou igual a 0'),
  materiais: z.number().min(0, 'Materiais deve ser maior ou igual a 0'),
  margem: z.number().min(0).max(100, 'Margem deve ser entre 0 e 100%'),
  impostos: z.number().min(0).max(100, 'Impostos deve ser entre 0 e 100%'),
  rounding: z.enum(['none', 'dezena', 'centena']),
});

type Form = z.infer<typeof schema>;

const roundingOptions: { value: RoundingMode; label: string; description: string }[] = [
  { value: 'none', label: 'Sem arredondamento', description: 'Valor exato (ex: R$ 1.234,56)' },
  { value: 'dezena', label: 'Arredondar para dezena', description: 'Arredonda para 10 (ex: R$ 1.230)' },
  { value: 'centena', label: 'Arredondar para centena', description: 'Arredonda para 100 (ex: R$ 1.200)' },
];

export const Calculadora: React.FC = () => {
  const { laborItems, materialItems, fetchByType } = useCatalog();
  const [activeTab, setActiveTab] = useState<'manual' | 'catalog'>('manual');
  const [result, setResult] = useState<ReturnType<typeof calcularPreco> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { horas: 10, valorHora: 150, materiais: 200, margem: 30, impostos: 10, rounding: 'none' },
    mode: 'onChange',
  });

  const values = watch();

  React.useEffect(() => {
    const calculated = calcularPreco({
      horas: values.horas || 0,
      valorHora: values.valorHora || 0,
      materiais: values.materiais || 0,
      margem: values.margem || 0,
      impostos: values.impostos || 0,
      rounding: values.rounding || 'none',
    });
    setResult(calculated);
  }, [values]);

  React.useEffect(() => {
    fetchByType('labor');
    fetchByType('material');
  }, [fetchByType]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleSaveAsTemplate = async () => {
    if (!isValid) return;
    setIsSaving(true);
    try {
      toast.success('Funcionalidade de salvar como serviço em desenvolvimento');
    } catch (error) {
      toast.error('Erro ao salvar serviço');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(formatCurrency(result.precoFinal));
    toast.success('Valor copiado!');
  };

  const applyLaborItem = (item: { valorHora: number; nome: string } | { materiais: number; nome: string }) => {
    if ('valorHora' in item) {
      setValue('valorHora', item.valorHora);
      setValue('horas', 1);
      setActiveTab('manual');
      toast.success(`Aplicado: ${item.nome}`);
    }
  };

  const applyMaterialItem = (item: { valorHora: number; nome: string } | { materiais: number; nome: string }) => {
    if ('materiais' in item) {
      setValue('materiais', item.materiais);
      setActiveTab('manual');
      toast.success(`Aplicado: ${item.nome}`);
    }
  };

  if (!result) return null;

  const InputField: React.FC<{
    label: string;
    icon: React.ElementType;
    register: UseFormRegister<Form>;
    name: keyof Form;
    type: string;
    step?: string;
    min?: string | number;
    max?: string | number;
    error?: any;
  }> = ({ label, icon: Icon, register, name, type, step, min, max, error }) => (
    <div>
      <Label htmlFor={name}>
        <Icon className="w-4 h-4 text-[var(--text-tertiary)]" aria-hidden="true" />
        {label}
      </Label>
      <Input
        {...register(name)}
        id={name}
        type={type}
        step={step}
        min={min}
        max={max}
        error={error?.message}
        disabled={false}
      />
    </div>
  );

  const SelectField: React.FC<{
    label: string;
    register: UseFormRegister<Form>;
    name: keyof Form;
    options: { value: string; label: string; description: string }[];
    error?: any;
  }> = ({ label, register, name, options, error }) => (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Select
        {...register(name)}
        id={name}
        options={options.map(o => ({ value: o.value, label: o.label }))}
        placeholder="Selecione"
        error={error?.message}
      />
    </div>
  );

  const ResultItem: React.FC<{
    label: string;
    value: string;
    icon: React.ElementType;
    highlight?: boolean;
    positive?: boolean;
  }> = ({ label, value, icon: Icon, highlight, positive }) => (
    <div className={`p-4 rounded-xl ${highlight ? 'bg-[var(--accent-lime)]/10 border border-[var(--accent-lime)]/20' : 'bg-[var(--bg-input)]'}`}>
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-1">
        <Icon className="w-4 h-4" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? 'text-[var(--accent-lime)]' : positive ? 'text-[var(--success-text)]' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );

  const CatalogItemCard: React.FC<{
    item: { id: string; nome: string; valorHora?: number; materiais?: number };
    type: 'labor' | 'material';
    onApply: (item: { valorHora: number; nome: string } | { materiais: number; nome: string }) => void;
  }> = ({ item, type, onApply }) => {
    const value = type === 'labor' ? item.valorHora : item.materiais;
    const Icon = type === 'labor' ? TrendingUp : DollarSign;
    const label = type === 'labor' ? 'Valor/hora' : 'Valor';

    return (
      <button
        type="button"
        onClick={() => onApply(type === 'labor' ? { valorHora: value || 0, nome: item.nome } : { materiais: value || 0, nome: item.nome })}
        className="p-4 bg-[var(--bg-input)] border border-[var(--border-default)] rounded-xl hover:border-[var(--accent-lime)] hover:bg-[var(--accent-lime)]/5 transition-all text-left group card-interactive"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[var(--bg-card)] group-hover:bg-[var(--accent-lime)]/10 transition-colors">
            <Icon className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--accent-lime)] transition-colors" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate group-hover:text-[var(--accent-lime)] transition-colors">{item.nome}</p>
            <p className="text-sm text-[var(--text-tertiary)]">
              {label}: {formatCurrency(value || 0)}
            </p>
          </div>
          <Check className="w-5 h-5 text-[var(--accent-lime)] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
        </div>
      </button>
    );
  };

  return (
    <div className="p-4 space-y-4 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[var(--accent-lime)]" />
            Calculadora de Preço
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Calcule o preço ideal para seus serviços</p>
        </div>
      </div>

      <div className="flex gap-2 bg-[var(--bg-input)] rounded-xl p-1">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'manual'
              ? 'bg-[var(--accent-lime)] text-black'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'catalog'
              ? 'bg-[var(--accent-lime)] text-black'
              : 'text-[var(--text-secondary)] hover:text-white'
          }`}
        >
          Catálogo
        </button>
      </div>

      {activeTab === 'manual' && (
        <form onSubmit={handleSubmit(handleSaveAsTemplate)} className="space-y-4">
          <GlassCard className="p-6 space-y-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Parâmetros do Cálculo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Horas trabalhadas"
                icon={RotateCcw}
                register={register}
                name="horas"
                type="number"
                step="0.5"
                min="0"
                error={errors.horas}
              />
              <InputField
                label="Valor por hora (R$)"
                icon={DollarSign}
                register={register}
                name="valorHora"
                type="number"
                step="0.01"
                min="0"
                error={errors.valorHora}
              />
              <InputField
                label="Materiais (R$)"
                icon={TrendingUp}
                register={register}
                name="materiais"
                type="number"
                step="0.01"
                min="0"
                error={errors.materiais}
              />
              <InputField
                label="Margem de lucro (%)"
                icon={Percent}
                register={register}
                name="margem"
                type="number"
                step="1"
                min="0"
                max="100"
                error={errors.margem}
              />
              <InputField
                label="Impostos (%)"
                icon={Percent}
                register={register}
                name="impostos"
                type="number"
                step="1"
                min="0"
                max="100"
                error={errors.impostos}
              />
              <SelectField
                label="Arredondamento"
                register={register}
                name="rounding"
                options={roundingOptions}
                error={errors.rounding}
              />
            </div>
          </GlassCard>

          <GlassCard variant="accent" className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--accent-lime)]" />
                Resultado do Cálculo
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCopyResult} className="flex items-center gap-1" leftIcon={<Copy className="w-4 h-4" />}>
                Copiar
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ResultItem
                label="Custo Total (Horas + Materiais)"
                value={formatCurrency(result.custoTotal)}
                icon={DollarSign}
              />
              <ResultItem
                label="Preço Base (com margem)"
                value={formatCurrency(result.precoBase)}
                icon={Percent}
              />
              <ResultItem
                label="Preço Final (com impostos)"
                value={formatCurrency(result.precoFinal)}
                icon={DollarSign}
                highlight
              />
              <ResultItem
                label="Lucro Estimado"
                value={formatCurrency(result.lucroEstimado)}
                icon={TrendingUp}
                positive
              />
            </div>

            <div className="pt-4 border-t border-[var(--border-default)]">
              <ResultItem
                label="Valor/Hora Efetivo"
                value={formatCurrency(result.valorHoraEfetivo)}
                icon={RotateCcw}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="primary" type="submit" disabled={!isValid || isSaving} className="flex-1" loading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Salvar como Serviço
              </Button>
              <Button variant="secondary" type="button" onClick={() => reset()} className="flex-1">
                Limpar
              </Button>
            </div>
          </GlassCard>
        </form>
      )}

      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Mão de Obra (Horas)
            </h2>
            {laborItems.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p>Nenhum serviço de mão de obra cadastrado</p>
                <Button variant="secondary" className="mt-2" onClick={() => setActiveTab('manual')}>
                  Calcular manualmente
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {laborItems.map((item) => (
                  <CatalogItemCard
                    key={item.id}
                    item={item}
                    type="labor"
                    onApply={applyLaborItem}
                  />
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Materiais
            </h2>
            {materialItems.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <p>Nenhum material cadastrado</p>
                <Button variant="secondary" className="mt-2" onClick={() => setActiveTab('manual')}>
                  Calcular manualmente
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {materialItems.map((item) => (
                  <CatalogItemCard
                    key={item.id}
                    item={item}
                    type="material"
                    onApply={applyMaterialItem}
                  />
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Calculadora;