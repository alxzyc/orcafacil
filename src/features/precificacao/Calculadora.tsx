import React, { useState } from 'react';
import { useForm, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GlassCard } from '../../components/GlassCard';
import { Button } from '../../components/Button';
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
  const [savedTemplateId, setSavedTemplateId] = useState<string | null>(null);

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

  // Calculate price in real-time
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

  // Load catalog items on mount
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
      // This would save to catalog service
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

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6 text-accent-lime" />
            Calculadora de Preço
          </h1>
          <p className="text-white/60 text-sm mt-1">Calcule o preço ideal para seus serviços</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 bg-white/5 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'manual'
              ? 'bg-accent-lime text-black'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'catalog'
              ? 'bg-accent-lime text-black'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Catálogo
        </button>
      </div>

      {/* Manual Form */}
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

          {/* Result Card */}
          <GlassCard className="p-6 space-y-5 bg-gradient-to-br from-white/5 to-white/2 border-accent-lime/20">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-lime" />
                Resultado do Cálculo
              </h2>
              <Button variant="ghost" size="sm" onClick={handleCopyResult} className="flex items-center gap-1">
                <Copy className="w-4 h-4" />
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

            <div className="pt-4 border-t border-white/10">
              <ResultItem
                label="Valor/Hora Efetivo"
                value={formatCurrency(result.valorHoraEfetivo)}
                icon={RotateCcw}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="primary" type="submit" disabled={!isValid || isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar como Serviço
                  </>
                )}
              </Button>
              <Button variant="secondary" type="button" onClick={() => reset()} className="flex-1">
                Limpar
              </Button>
            </div>
          </GlassCard>
        </form>
      )}

      {/* Catalog Tab */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Mão de Obra (Horas)
            </h2>
            {laborItems.length === 0 ? (
              <div className="text-center py-8 text-white/50">
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
              <div className="text-center py-8 text-white/50">
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

// Input Field Component
interface InputFieldProps {
  label: string;
  icon: React.ElementType;
  register: UseFormRegister<Form>;
  name: keyof Form;
  type: string;
  step?: string;
  min?: string | number;
  max?: string | number;
  error?: any;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  icon: Icon,
  register,
  name,
  type,
  step,
  min,
  max,
  error,
}) => (
  <div>
    <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-1">
      <Icon className="w-4 h-4 text-white/50" aria-hidden="true" />
      {label}
    </label>
    <input
      {...register(name)}
      type={type}
      step={step}
      min={min}
      max={max}
      className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${error ? 'border-red-500' : ''}`}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${name}-error` : undefined}
    />
    {error && (
      <p id={`${name}-error`} className="mt-1 text-sm text-red-400 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" aria-hidden="true" />
        {error.message}
      </p>
    )}
  </div>
);

// Select Field Component
interface SelectFieldProps {
  label: string;
  register: UseFormRegister<Form>;
  name: keyof Form;
  options: { value: string; label: string; description: string }[];
  error?: any;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, register, name, options, error }) => (
  <div>
    <label className="block text-sm font-medium text-white/80 mb-2">{label}</label>
    <select
      {...register(name)}
      className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-accent-lime/50 focus:border-transparent transition-all ${error ? 'border-red-500' : ''}`}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={error ? `${name}-error` : undefined}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && (
      <p id={`${name}-error`} className="mt-1 text-sm text-red-400 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" aria-hidden="true" />
        {error.message}
      </p>
    )}
  </div>
);

// Result Item Component
interface ResultItemProps {
  label: string;
  value: string;
  icon: React.ElementType;
  highlight?: boolean;
  positive?: boolean;
}

const ResultItem: React.FC<ResultItemProps> = ({ label, value, icon: Icon, highlight, positive }) => (
  <div className={`p-4 rounded-xl ${highlight ? 'bg-accent-lime/10 border border-accent-lime/20' : 'bg-white/5'}`}>
    <div className="flex items-center gap-2 text-sm text-white/60 mb-1">
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span>{label}</span>
    </div>
    <p className={`text-2xl font-bold ${highlight ? 'text-accent-lime' : positive ? 'text-green-400' : 'text-white'}`}>
      {value}
    </p>
  </div>
);

// Catalog Item Card Component
interface CatalogItemCardProps {
  item: { id: string; nome: string; valorHora?: number; materiais?: number };
  type: 'labor' | 'material';
  onApply: (item: { valorHora: number; nome: string } | { materiais: number; nome: string }) => void;
}

const CatalogItemCard: React.FC<CatalogItemCardProps> = ({ item, type, onApply }) => {
  const value = type === 'labor' ? item.valorHora : item.materiais;
  const Icon = type === 'labor' ? TrendingUp : DollarSign;
  const label = type === 'labor' ? 'Valor/hora' : 'Valor';

  return (
    <button
      type="button"
      onClick={() => onApply(type === 'labor' ? { valorHora: value || 0, nome: item.nome } : { materiais: value || 0, nome: item.nome })}
      className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-accent-lime/50 hover:bg-accent-lime/5 transition-all text-left group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-accent-lime/10 transition-colors">
          <Icon className="w-5 h-5 text-white/70 group-hover:text-accent-lime transition-colors" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate group-hover:text-accent-lime transition-colors">{item.nome}</p>
          <p className="text-sm text-white/50">
            {label}: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)}
          </p>
        </div>
        <Check className="w-5 h-5 text-accent-lime opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
      </div>
    </button>
  );
};





