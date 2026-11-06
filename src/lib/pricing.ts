export type RoundingMode = 'none' | 'dezena' | 'centena';

export interface CalcInput {
  horas: number;
  valorHora: number;
  materiais: number;
  margem: number; // %
  impostos: number; // %
  rounding: RoundingMode;
}

function arredondar(valor: number, mode: RoundingMode): number {
  if (mode === 'none') return Math.round(valor * 100) / 100;
  if (mode === 'dezena') return Math.round(valor / 10) * 10;
  if (mode === 'centena') return Math.round(valor / 100) * 100;
  return valor;
}

export function calcularPreco(input: CalcInput) {
  const { horas, valorHora, materiais, margem, impostos, rounding } = input;
  const custoTotal = horas * valorHora + materiais;
  const precoBase = custoTotal / (1 - margem / 100);
  const precoFinalBruto = precoBase / (1 - impostos / 100);
  const precoFinal = arredondar(precoFinalBruto, rounding);
  const lucroEstimado = precoFinal - custoTotal;
  const valorHoraEfetivo = horas > 0 ? precoFinal / horas : 0;

  return {
    custoTotal,
    precoBase,
    precoFinal,
    lucroEstimado,
    valorHoraEfetivo,
  };
}




