# OrçaFácil Pricing

## Fórmulas
- custo_total = (horas × valor_hora) + materiais
- preco_base = custo_total / (1 - margem/100)
- preco_final = preco_base / (1 - impostos/100)
- Arredondar conforme configuração: sem centavos, dezena ou centena

Função pura em `src/lib/pricing.ts`
```ts
export type RoundingMode = 'none' | 'dezena' | 'centena';
export function calcularPreco({ horas, valorHora, materiais, margem, impostos, rounding }: ...) { ... }
```

## Regras de negócio
- Totais sempre recalculados a partir dos itens, nunca armazenados digitados
- Salvar cálculo como serviço reutilizável
- Testes em `src/lib/pricing.test.ts`

Casos de teste:
1. horas 10, valor 100, materiais 0, margem 20, impostos 10 → preço final esperado
2. Arredondamento dezena
3. Margem zero
