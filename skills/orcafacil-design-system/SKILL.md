# OrçaFácil Design System

## Tokens
Ver `src/styles/tokens.css`.

Cores base:
- Fundo base `#0F0E17`, superfície `#17151F`, card `#1F1C2B`
- Glass: `bg-white/5 backdrop-blur-xl border-white/10`
- Primária: `#7C4DFF` → `#A855F7`
- Destaque: `#B8F25C`
- Teal: `#3E7C84`
- Laranja: `#F5A65B`
- Semânticas: sucesso `#22C55E`, alerta `#F59E0B`, erro `#F43F5E`, info `#38BDF8`
- Texto: `#F5F5F7` principal, `#A1A1AA` secundário

## Componentes base
- GlassCard
- StatCard
- Button variants: primary, secondary, ghost, danger
- Input, Select
- Badge status
- ProgressRing
- ListItem (ícone, título, subtítulo, valor)
- EmptyState, Modal, BottomSheet
- BottomNav com FAB central
- PageHeader com voltar e MonthPicker

## Regras visuais
- Tema escuro padrão, claro opcional via `[data-theme="light"]`
- Raios: 20px cards, 12px inputs, pílulas botões ação
- Tipografia: Poppins títulos/valores, Inter texto
- Espaçamento múltiplos de 4px, toque mínimo 44px
- Contraste WCAG AA
