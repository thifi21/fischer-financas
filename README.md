# 💰 Fischer Finanças 2026

> Sistema de controle financeiro familiar completo desenvolvido para a **Família Fischer**.

**Desenvoldido por:** Thiago Fischer  
**Versão:** 3.5.0 — PWA, IA & Fase 6 (Telegram) Implementada 🚀  
**Ano:** 2026  
**Stack:** Next.js 14 · TypeScript · Supabase · Tailwind CSS · Gemini AI · Telegram API

---

## ✨ Funcionalidades Premium

| Módulo | Descrição |
|---|---|
| 📊 **Dashboard 2.0** | Gráficos dinâmicos com **Sankey Flow** para visualização do fluxo de caixa. |
| 💰 **Extrato & Conciliação** | Controle total de lançamentos com status de conferência (OK/Pendente). |
| 🤖 **Telegram Bot** | Notificações automáticas em tempo real para pagamentos e vencimentos. |
| 🎯 **Sonhos & Objetivos** | Gestão de metas de longo prazo com priorização e progresso visual. |
| 📱 **Ecosystem (PWA & Mobile)** | Aplicativo nativo (Expo) e **PWA Offline-First** de alta performance. |
| 🆕 **IA Financeira** | Análise narrativa de gastos e chat inteligente via **Google Gemini AI**. |
| 🆕 **Open Finance** | Importação inteligente de arquivos **OFX** e **CSV**. |
| 🆕 **Modo Família** | Orçamento compartilhado com gestão de membros e convites. |
| 🆕 **Investimentos** | Simulador avançado de juros compostos e independência financeira. |

---

## ⚡ Otimização & Performance

- **Lazy Loading**: Gráficos e componentes pesados carregados sob demanda.
- **Sankey Flow**: Visualização SVG animada via Framer Motion para entender para onde vai cada centavo.
- **Conciliação Bancária**: Campo `conferido` em todos os lançamentos para match perfeito com o extrato.

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

## 📁 Estrutura do Projeto (v3.5)

```
fischer-financas/
├── mobile/                        ← App React Native (Expo)
├── src/
│   ├── app/
│   │   ├── api/telegram/          ← Webhook de notificações
│   │   ├── dashboard/
│   │   │   ├── extrato/           ← Central de conciliação unificada
│   │   │   ├── sonhos/            ← Metas de longo prazo [NEW]
│   │   │   ├── ia-analise/        ← IA Gemini
│   │   │   └── ...
│   ├── components/
│   │   ├── SankeyFlow.tsx         ← Fluxo de caixa visual [NEW]
│   │   └── DashboardClientView    ← Core do dashboard
│   ├── lib/
│   │   ├── telegram.ts            ← Integração de alertas [NEW]
│   │   └── notifications.ts       ← Engine de notificações
└── supabase/
    └── migrations/
        ├── MIGRATIONS_FASE4.sql   ← Cleanup e correções
        ├── MIGRATIONS_FASE5.sql   ← Extrato e Conciliação
        └── MIGRATIONS_FASE6.sql   ← Telegram e Notificações
```

---

## 📖 Documentação Completa

- [Manual Detalhado (Wiki)](./DOCUMENTACAO.md)
- [Histórico de Mudanças](./docs/CHANGELOG.md)
- [Tutorial Google Drive](./docs/GOOGLE_DRIVE.md)

---

*Fischer Finanças 2026 — Desenvolvido por **Thiago Fischer***
