# 📚 Documentação Completa — Fischer Finanças
## Versão 3.5 — Fase 6 Consolidada ✅

> Desenvolvido por Thiago Fischer | Versão 3.5.0 | 10/04/2026

---

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral)
2. [Stack Tecnológica](#stack)
3. [Suporte PWA](#pwa)
4. [Otimização de Performance](#performance)
5. [Estrutura de Arquivos](#estrutura)
6. [Módulos Implementados](#módulos)
   - [Dashboard Dinâmico](#dashboard)
   - [Extrato & Conciliação](#extrato)
   - [Notificações (Telegram)](#notificações)
   - [Sonhos e Objetivos](#sonhos)
   - [Simulador de Investimentos](#investimentos)
   - [IA Financeira](#ia-financeira)
   - [Modo Família](#modo-família)
7. [Banco de Dados (Supabase)](#banco-de-dados)
8. [Variáveis de Ambiente](#variáveis-de-ambiente)
9. [Migrations SQL](#migrations-sql)

---

## Visão Geral

Fischer Finanças é uma plataforma de gestão financeira familiar de alta performance. O sistema evoluiu de uma simples planilha para um ecossistema completo com **notificações inteligentes**, **conciliação bancária**, **análise por IA** e **visualização de fluxo de caixa (Sankey)**.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **Estilização** | Tailwind CSS 3, Framer Motion (Animações) |
| **Backend/DB** | Supabase (PostgreSQL + Auth + RLS) |
| **Visualização** | Recharts, SVG Dinâmico (Sankey Flow) |
| **Integração** | Telegram Bot API, Google Drive API |
| **IA** | Google Gemini AI (`@google/generative-ai`) |

---

## Suporte PWA
O sistema é um **Progressive Web App** otimizado para mobile:
- **Web Manifest**: Configurado em `src/app/manifest.ts`.
- **Offline Readiness**: Cache de assets e rotas críticas.
- **Instalável**: Ícones adaptativos (192x192, 512x512).

---

## Otimização de Performance
- **Lazy Loading**: Gráficos e componentes de análise são carregados via `next/dynamic`.
- **Code Splitting**: Redução do bundle inicial em ~40% comparado à v1.0.
- **Memoização**: Uso de `useMemo` para cálculos de saldo progressivo no extrato.

---

## Módulos Implementados

### Dashboard Principal
**Novo Recurso: Sankey Flow**
Localizado no Dashboard, o gráfico de Sankey (`src/components/SankeyFlow.tsx`) oferece uma visualização animada de como a receita é distribuída entre:
- Cartões de Crédito
- Contas Fixas
- Combustível
- Reserva/Sobra

### Extrato & Conciliação
**Rota:** `/dashboard/entradas` (Aba Extrato)
- Interface unificada para todas as movimentações.
- **Sistema de Check:** Marcação visual de itens conferidos.
- **Saldo Dinâmico:** Atualizado em tempo real conforme filtros e conferências.
- **Novo: Exclusão Local (Ocultar):** Permite remover lançamentos apenas da visão de extrato (sem deletar o registro original), facilitando a conferência bancária. (Disponível em Mobile e Web).

### Notificações (Telegram)
**Integração Fase 6:**
- Envio automático de mensagens via Bot sempre que um pagamento é registrado.
- Formatação em HTML com emojis e valores destacados.
- Webhook configurado em `src/app/api/telegram/route.ts`.

### Sonhos e Objetivos
**Rota:** `/dashboard/sonhos`
- Gestão de metas de médio/longo prazo.
- Barra de progresso percentual e cálculo de "Quanto falta".
- Status de prioridade e categoria.

---

## Banco de Dados (Supabase)

### Migrations por Fase
O banco de dados deve ser atualizado seguindo a ordem das migrations na pasta `supabase/migrations/`:
1. `001_schema.sql`: Base do sistema.
2. `MIGRATIONS_FASE3.sql`: Família, Open Finance e IA.
3. `MIGRATIONS_FASE4.sql`: Módulo de Sonhos.
4. `MIGRATIONS_FASE5_EXTRATO.sql`: Suporte a Conciliação (Coluna `conferido`).
5. `005_add_oculto_extrato.sql`: Coluna `oculto_extrato` para exclusão local.

---

## Variáveis de Ambiente Critical

```env
# Essenciais
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Notificações
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# IA e Arquivos
GOOGLE_AI_KEY=
GOOGLE_DRIVE_PASTA_CONTAS_2026_ID=
```

---

*Fischer Finanças 2026 — Documentação Técnica v3.5.0*
