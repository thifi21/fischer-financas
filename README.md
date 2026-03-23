# 💰 Fischer Finanças 2026

> Sistema de controle financeiro familiar desenvolvido para a **Família Fischer**.

**Desenvolvido por:** Thiago Fischer  
**Versão:** 1.0.0  
**Ano:** 2026  
**Stack:** Next.js 14 · TypeScript · Supabase · Tailwind CSS · Vercel

---

## ✨ Funcionalidades

| Módulo | Descrição |
|---|---|
| 📊 **Dashboard** | Visão geral do mês com gráficos de pizza e barras, saldo em destaque e barras de progresso por categoria |
| 💳 **Cartões de Crédito** | Controle de faturas com lançamentos detalhados. Total atualiza automaticamente ao adicionar itens |
| 🏠 **Contas Fixas** | Contas agrupadas por categoria com totais de cartões integrados e resumo do mês |
| 💵 **Entradas / Salários** | Registro de receitas mensais (salários, freelances, extras) |
| ⛽ **Combustível** | Controle de abastecimentos com litros, KM e preço por litro |
| ☁️ **Google Drive** | Upload de comprovantes diretamente para a pasta `Contas 2026/[Mês]/Pagas` |

---

## 🛠️ Tecnologias

- **[Next.js 14](https://nextjs.org)** — Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org)** — Tipagem estática
- **[Supabase](https://supabase.com)** — Banco de dados PostgreSQL + Autenticação
- **[Tailwind CSS](https://tailwindcss.com)** — Estilização
- **[Recharts](https://recharts.org)** — Gráficos interativos
- **[Google Drive API](https://developers.google.com/drive)** — Upload de comprovantes via Service Account
- **[Vercel](https://vercel.com)** — Deploy e hospedagem

---

## 🚀 Deploy

O sistema está hospedado na Vercel com deploy automático via GitHub.

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

Estrutura no Supabase (PostgreSQL):

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
├── docs/                          # Documentação
│   ├── GOOGLE_DRIVE.md            # Tutorial integração Drive
│   └── CHANGELOG.md               # Histórico de versões
├── scripts/
│   └── importar-dados.ts          # Script de importação da planilha original
├── src/
│   ├── app/
│   │   ├── api/drive/upload/      # API Route — upload Google Drive
│   │   ├── dashboard/
│   │   │   ├── cartoes/           # Cartões de crédito
│   │   │   ├── combustivel/       # Combustível
│   │   │   ├── contas-fixas/      # Contas fixas + cartões
│   │   │   ├── entradas/          # Entradas/salários
│   │   │   ├── layout.tsx         # Layout com sidebar e topbar
│   │   │   └── page.tsx           # Dashboard principal
│   │   ├── layout.tsx             # Root layout (tema)
│   │   └── page.tsx               # Tela de login
│   ├── components/
│   │   ├── DrivePanel.tsx         # Painel de comprovantes na sidebar
│   │   └── DriveUploadModal.tsx   # Modal de upload de comprovantes
│   ├── lib/
│   │   ├── supabase.ts            # Cliente Supabase
│   │   └── utils.ts               # Funções auxiliares
│   ├── styles/
│   │   └── globals.css            # Estilos globais + dark mode
│   └── types/
│       └── index.ts               # Tipos TypeScript
└── supabase/
    └── migrations/
        ├── 001_schema.sql         # Criação das tabelas
        └── 002_seed_dados.sql     # Dados importados da planilha
```

---

## 📖 Documentação

- [Tutorial Google Drive](./docs/GOOGLE_DRIVE.md)
- [Histórico de Versões](./docs/CHANGELOG.md)

---

*Fischer Finanças 2026 — Desenvolvido por **Thiago Fischer***
