# 💰 Fischer Finanças 2026

> Sistema de controle financeiro familiar desenvolvido para a **Família Fischer**.

**Desenvolvido por:** Thiago Fischer  
**Versão:** 1.3.0  
**Ano:** 2026  
**Stack:** Next.js 14 · TypeScript · Supabase · Tailwind CSS · Vercel

---

## ✨ Funcionalidades

| Módulo | Descrição |
|---|---|
| 📊 **Dashboard** | Visão geral com gráficos de pizza, barras, saldo e barras de progresso por categoria |
| 💳 **Cartões de Crédito** | Faturas com lançamentos detalhados. Parcelas criadas automaticamente nos meses futuros |
| 🏠 **Contas Fixas** | Contas por categoria com seção de cartões integrada e resumo completo do mês |
| 💵 **Entradas / Salários** | Receitas mensais com categorias (Salário, Freelance, Extra, Investimento) |
| ⛽ **Combustível** | Abastecimentos com mês/ano derivados da data — suporte a lançamentos retroativos |
| 📱 **App Mobile** | Aplicativo nativo (iOS/Android) com Expo consumindo a mesma API |
| ☁️ **Google Drive** | Upload de comprovantes direto para `Contas 2026/[Mês]/Pagas` via Service Account |
| 📈 **Cotações** | Dólar, Euro, PETR4 e CDI em tempo real na sidebar (atualiza a cada 5 min) |

---

## 🛠️ Tecnologias

- **[Next.js 14](https://nextjs.org)** — Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org)** — Tipagem estática
- **[Supabase](https://supabase.com)** — Banco de dados PostgreSQL + Autenticação
- **[Tailwind CSS](https://tailwindcss.com)** — Estilização com dark mode
- **[Recharts](https://recharts.org)** — Gráficos interativos
- **[Google Drive API](https://developers.google.com/drive)** — Upload via Service Account
- **[Vercel](https://vercel.com)** — Deploy e hospedagem

---

## 🚀 Deploy

Sistema hospedado na Vercel com deploy automático via GitHub.

### Variáveis de ambiente necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Google Drive (Service Account)
GOOGLE_PROJECT_ID=
GOOGLE_PRIVATE_KEY_ID=
GOOGLE_PRIVATE_KEY=
GOOGLE_CLIENT_EMAIL=
GOOGLE_CLIENT_ID=
GOOGLE_DRIVE_PASTA_CONTAS_2026_ID=
```

---

## 🗄️ Banco de Dados

| Tabela | Descrição |
|---|---|
| `cartoes` | Faturas de cartão por mês |
| `lancamentos_cartao` | Itens detalhados de cada fatura |
| `contas_fixas` | Contas fixas mensais por categoria |
| `entradas` | Receitas e salários mensais |
| `combustivel` | Registros de abastecimento |

Todas as tabelas usam **Row Level Security (RLS)** — cada usuário acessa apenas seus próprios dados.

---

## 📁 Estrutura do Projeto

```
fischer-financas/
├── mobile/                        ← Aplicativo nativo em React Native (Expo)
├── docs/
│   ├── CHANGELOG.md               ← Histórico completo de versões
│   └── GOOGLE_DRIVE.md            ← Tutorial integração Drive
├── scripts/
│   └── importar-dados.ts          ← Importação da planilha original
├── src/
│   ├── app/
│   │   ├── api/drive/upload/      ← API upload Google Drive
│   │   ├── dashboard/
│   │   │   ├── cartoes/           ← Cartões + lançamentos + parcelas automáticas
│   │   │   ├── combustivel/       ← Abastecimentos com data retroativa
│   │   │   ├── contas-fixas/      ← Contas + cartões integrados
│   │   │   ├── entradas/          ← Receitas e salários
│   │   │   ├── layout.tsx         ← Sidebar, topbar, contexto de mês
│   │   │   └── page.tsx           ← Dashboard principal
│   │   ├── layout.tsx             ← Root layout (tema claro/escuro)
│   │   └── page.tsx               ← Tela de login
│   ├── components/
│   │   ├── CotacoesPanel.tsx      ← Dólar, Euro, PETR4, CDI ao vivo
│   │   ├── DrivePanel.tsx         ← Painel de comprovantes na sidebar
│   │   └── DriveUploadModal.tsx   ← Modal de upload de comprovantes
│   ├── context/
│   │   └── MesContext.tsx         ← Contexto global do mês ativo
│   ├── lib/
│   │   ├── supabase.ts            ← Cliente Supabase
│   │   └── utils.ts               ← formatBRL, formatDate, formatVencimento
│   ├── styles/
│   │   └── globals.css            ← Estilos globais + dark mode
│   └── types/
│       └── index.ts               ← Tipos TypeScript + constantes
└── supabase/
    └── migrations/
        ├── 001_schema.sql         ← Criação das tabelas + RLS
        ├── 002_seed_dados.sql     ← Dados importados da planilha
        └── 003_tricard_seed.sql   ← Dados do cartão Tricard
```

---

## 📖 Documentação

- [Histórico de Versões](./docs/CHANGELOG.md)
- [Tutorial Google Drive](./docs/GOOGLE_DRIVE.md)
- [Documentação do App Mobile](./mobile/README.md)

---

*Fischer Finanças 2026 — Desenvolvido por **Thiago Fischer***
