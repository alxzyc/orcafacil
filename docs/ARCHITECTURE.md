# Arquitetura Técnica: OrçaFácil

## Visão Geral
OrçaFácil é um SaaS multiusuário de orçamentação ágil. O foco principal é a integridade dos dados históricos (snapshots), segurança do portal público (RLS + RPC) e flexibilidade de cálculo de precificação híbrida.

## Estrutura de Pastas
```text
src/
├── core/                # Regras de negócio puras (sem dependências)
│   ├── pricing/         # Cálculos de materiais, mão de obra, markup
│   ├── models/          # Entidades do domínio (Types)
│   └── calculations/    # Lógica de descontos e parcelamentos
├── infrastructure/      # Implementação (Supabase Client, Repositories)
├── services/            # Serviços de aplicação que orquestram regras e persistência
├── tests/               # Testes unitários de regras e cálculo
docs/                    # Documentação detalhada
supabase/                # Migrations SQL e configuração
```

## Entidades e Snapshots
Para preservar o histórico, utilizamos a técnica de Snapshot em `budget_items`:
- **Resources**: Catálogo (fonte da verdade).
- **Budget Items**: Cópia congelada dos valores no ato da criação da proposta.

## Segurança e Portal Público
- **RLS**: Todo acesso autenticado é filtrado por `profile_id` (empresa/usuário dono dos dados).
- **Acesso Público**: Via `public_token` (UUID). O acesso aos detalhes da proposta é feito via RLS baseado no token ou via RPC Security Definer para ações de "aceite" ou "recusa", evitando que usuários públicos alterem dados sensíveis.
