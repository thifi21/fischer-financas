# 💰 Fischer Finanças 2026

> Sistema de controle financeiro familiar completo desenvolvido para a **Família Fischer**.

**Desenvolvido por:** Thiago Fischer  
**Versão:** 3.6.1 — Segurança de APIs, Limpeza de Código 🧹  
**Ano:** 2026  
**Stack:** Next.js 15 · TypeScript · Supabase · Tailwind CSS · Gemini AI · Telegram API

---

## ✨ Funcionalidades Premium

| Módulo | Descrição |
|---|---|
| 📊 **Dashboard 2.0** | Gráficos dinâmicos com **Sankey Flow** para visualização do fluxo de caixa. |
| 💰 **Extrato & Conciliação** | Controle total de lançamentos com status de conferência (OK/Pendente). |
| 🤖 **Telegram Bot** | Notificações automáticas em tempo real para pagamentos e vencimentos. |
| 🎯 **Sonhos & Objetivos** | Gestão de metas de longo prazo com priorização e progresso visual. |
| 📱 **Ecosystem (PWA & Mobile)** | Aplicativo nativo (Expo) e **PWA Offline-First** de alta performance. |
| 🆕 **IA Financeira** | Chat inteligente via **Google Gemini AI** com rate limiting e proteção de custo. |
| 🆕 **Open Finance** | Importação inteligente de arquivos **OFX** e **CSV**. |
| 🆕 **Modo Família** | Orçamento compartilhado com gestão de membros e convites. |
| 🆕 **Investimentos** | Simulador avançado de juros compostos e independência financeira. |

---

## ⚡ Otimização & Performance (v3.6)

- **Supabase Singleton**: Cliente instanciado via `useMemo` — zero re-conexões desnecessárias.
- **UserContext Centralizado**: `userId` resolvido uma única vez por sessão no layout, eliminando chamadas redundantes ao Supabase Auth em todas as páginas.
- **Race Condition Guard**: Contador de geração (`loadGenRef`) descarta respostas de fetches obsoletos ao navegar rapidamente entre meses.
- **Clock Isolado**: Componente `<Clock />` extraído do layout — apenas o relógio re-renderiza por segundo, não o layout inteiro.
- **Formatter Singleton**: `Intl.NumberFormat` instanciado uma única vez em `formatBRL` — sem alocação nova por chamada.
- **Lazy Loading**: Gráficos e componentes pesados carregados sob demanda.
- **Sankey Flow**: Visualização SVG animada via Framer Motion para entender para onde vai cada centavo.

---

## 🔐 Segurança (v3.6)

- **Rate Limiting**: Máximo de 20 requisições/minuto por IP na rota `/api/chat` (proteção de custo da API Gemini).
- **HTTP Security Headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` configurados em `next.config.js`.
- **Isolamento de Sessão**: Variáveis globais `cachedUserId` removidas — sem vazamento de dados entre sessões.

---

## 🧑‍💻 UX (v3.6)

- **Atalhos de Teclado**: `←` / `→` navega entre meses, `Alt+←` / `Alt+→` navega entre anos (ignorado em campos de texto).
- **Badge "Hoje"**: Sidebar destaca o mês atual com badge verde para navegação rápida.

---

## 📱 Suporte PWA (Progressive Web App)

- **Offline Support**: Cache de assets críticos para funcionamento sem internet.
- **Instalação**: Ícones premium configurados para Android e iOS.
- **Splash Screen**: Experiência de app nativo desde o carregamento.

---

## 🤖 Integração Telegram Bot

Configure as variáveis para receber notificações automáticas:
- `TELEGRAM_BOT_TOKEN`: Token gerado pelo BotFather.
- `TELEGRAM_CHAT_ID`: ID do chat/grupo para notificações.

---

## 📁 Estrutura do Projeto (v3.6.1)

```
fischer-financas/
├── mobile/                        ← App React Native (Expo)
├── scripts/
│   └── importar-dados.ts          ← Script manual de importação de dados
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/              ← Gemini AI (com rate limiting)
│   │   │   ├── drive/             ← Upload para Google Drive
│   │   │   ├── familia/           ← Gestão de membros da família
│   │   │   ├── ia/                ← Análise financeira via Gemini
│   │   │   ├── open-finance/      ← Importação OFX/CSV
│   │   │   ├── telegram/          ← Webhook de notificações
│   │   │   └── whatsapp/          ← Notificações WhatsApp
│   │   └── dashboard/
│   │       ├── layout.tsx         ← Atalhos de teclado + UserProvider + Clock isolado
│   │       ├── cartoes/           ← Race condition guard + exclusão precisa de parcelas
│   │       ├── contas-fixas/      ← Race condition guard + useMemo supabase
│   │       ├── entradas/          ← useMemo supabase
│   │       ├── metas/             ← MetaCard externo + useMemo supabase
│   │       ├── relatorios/        ← useMemo supabase
│   │       ├── combustivel/       ← useMemo + dep array com ano
│   │       ├── sonhos/            ← Metas de longo prazo
│   │       └── ia-analise/        ← IA Gemini
│   ├── components/
│   │   ├── AIChatBot.tsx          ← Speech cleanup + split otimizado
│   │   ├── CotacoesPanel.tsx      ← Cotações client-side (USD, EUR, PETR4, CDI)
│   │   ├── SankeyFlow.tsx         ← Fluxo de caixa visual
│   │   ├── DrivePanel.tsx         ← Painel Google Drive
│   │   └── DashboardClientView    ← Core do dashboard
│   ├── context/
│   │   ├── MesContext.tsx         ← Fonte única de verdade para mês/ano
│   │   └── UserContext.tsx        ← userId centralizado para todo o dashboard
│   ├── lib/
│   │   ├── api-auth.ts            ← [NOVO] Rate limiting + autenticação de rotas API
│   │   ├── auth-fetch.ts          ← [NOVO] fetch autenticado do lado do cliente
│   │   ├── ai-analise.ts          ← Engine Gemini + heurística financeira
│   │   ├── ofx-parser.ts          ← Parser OFX/CSV
│   │   ├── utils.ts               ← formatBRL com Intl singleton
│   │   ├── telegram.ts            ← Integração de alertas
│   │   └── notifications.ts       ← Engine de notificações
└── supabase/
    └── migrations/
        ├── MIGRATIONS.sql             ← Schema inicial
        ├── MIGRATIONS_FASE3.sql       ← Investimentos e Sonhos
        ├── MIGRATIONS_FASE4.sql       ← Cleanup e correções
        ├── MIGRATIONS_FASE5_EXTRATO.sql ← Extrato e Conciliação
        └── 002_security_serverless.sql  ← [NOVO] Segurança serverless
```

---

## 📖 Documentação Completa

- [Manual Detalhado (Wiki)](./DOCUMENTACAO.md)
- [Histórico de Mudanças](./docs/CHANGELOG.md)
- [Tutorial Google Drive](./docs/GOOGLE_DRIVE.md)

---

*Fischer Finanças 2026 — Desenvolvido por **Thiago Fischer***
