# 📚 Documentação Completa — Fischer Finanças
## Versão 2.0 — Fase 3 Implementada

> Desenvolvido por Thiago Fischer | Atualizado em 27/03/2026

---

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral)
2. [Stack Tecnológica](#stack)
3. [Estrutura de Arquivos](#estrutura)
4. [Módulos Implementados](#módulos)
   - [Dashboard Principal](#dashboard)
   - [Cartões de Crédito](#cartões)
   - [Contas Fixas](#contas-fixas)
   - [Entradas / Salários](#entradas)
   - [Combustível](#combustível)
   - [Metas e Orçamento](#metas)
   - [Relatórios](#relatórios)
   - [Notificações](#notificações)
   - [🆕 Open Finance](#open-finance)
   - [🆕 IA Financeira](#ia-financeira)
   - [🆕 Modo Família](#modo-família)
   - [🆕 Investimentos](#investimentos)
5. [Banco de Dados (Supabase)](#banco-de-dados)
6. [Variáveis de Ambiente](#variáveis-de-ambiente)
7. [Como Executar](#como-executar)
8. [Migrations SQL](#migrations-sql)

---

## Visão Geral

Fischer Finanças é um sistema completo de gestão financeira pessoal e familiar, desenvolvido em **Next.js 14** com **Supabase** como backend. O sistema permite controle de cartões de crédito, contas fixas, combustível, Metas/orçamento, relatórios avançados, importação Open Finance via OFX/CSV, análise por IA (Gemini), modo família compartilhado e simulador de investimentos.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Estilização | Tailwind CSS 3 |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS) |
| Gráficos | Recharts |
| Armazenamento de arquivos | Google Drive (Service Account) |
| IA Financeira | Google Gemini AI (`@google/generative-ai`) |
| Cotações | API HG Brasil (Yahoo Finance) |

---

## Estrutura de Arquivos

```
fischer-financas/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Página de login
│   │   ├── layout.tsx                  # Layout raiz
│   │   ├── api/
│   │   │   ├── drive/                  # API Google Drive
│   │   │   ├── open-finance/           # 🆕 API importação OFX/CSV
│   │   │   ├── ia/                     # 🆕 API análise Gemini
│   │   │   └── familia/                # 🆕 API grupos familiares
│   │   └── dashboard/
│   │       ├── layout.tsx              # Sidebar + topbar
│   │       ├── page.tsx                # Dashboard principal
│   │       ├── cartoes/                # Cartões de crédito
│   │       ├── contas-fixas/           # Contas fixas
│   │       ├── entradas/               # Entradas/salários
│   │       ├── combustivel/            # Abastecimentos
│   │       ├── metas/                  # Metas de orçamento
│   │       ├── relatorios/             # Relatórios + PDF + projeção
│   │       ├── notificacoes/           # Lembretes
│   │       ├── open-finance/           # 🆕 Simulador Open Finance
│   │       ├── ia-analise/             # 🆕 IA Financeira (Gemini)
│   │       ├── familia/                # 🆕 Modo Família
│   │       └── investimentos/          # 🆕 Simulador de Investimentos
│   ├── components/
│   │   ├── CotacoesPanel.tsx           # Cotações de moedas/ações
│   │   ├── DrivePanel.tsx              # Painel Google Drive
│   │   └── DriveUploadModal.tsx        # Modal de upload
│   ├── context/
│   │   └── MesContext.tsx              # Contexto de mês/ano global
│   ├── lib/
│   │   ├── supabase.ts                 # Cliente Supabase
│   │   ├── utils.ts                    # Formatadores (BRL, datas)
│   │   ├── ofx-parser.ts               # 🆕 Parser OFX/CSV
│   │   └── ai-analise.ts               # 🆕 Engine IA Gemini
│   ├── styles/
│   │   └── globals.css                 # Estilos globais + classes utilitárias
│   └── types/
│       └── index.ts                    # Types TypeScript
├── .env.local                          # Variáveis de ambiente
├── MIGRATIONS.sql                      # Migrations Fase 1+2
├── MIGRATIONS_FASE3.sql                # 🆕 Migrations Fase 3
├── DOCUMENTACAO.md                     # Este arquivo
├── package.json
├── tailwind.config.js
└── next.config.js
```

---

## Módulos Implementados

### Dashboard
**Rota:** `/dashboard`

Visão geral do mês selecionado com:
- Cards de resumo: Entradas, Cartões, Contas Fixas, Total Saídas
- Indicador de Saldo (positivo/negativo)
- Gráfico de pizza: distribuição de gastos do mês
- Gráfico de barras: Entradas vs Saídas do ano
- Barras de progresso por categoria

---

### Cartões de Crédito
**Rota:** `/dashboard/cartoes`

- Gerenciamento por cartão (Hipercard, Nubank, C6, etc.)
- Lançamentos individuais por cartão com status de conferência
- Faturas mensais com vencimento
- Status de pagamento (pago/pendente)

---

### Contas Fixas
**Rota:** `/dashboard/contas-fixas`

- Categorias: Moradia, Serviços, Saúde, Educação, etc.
- Data de vencimento e parcelas
- Status de pagamento por conta

---

### Entradas / Salários
**Rota:** `/dashboard/entradas`

- Registro de rendas por categoria (Salário, Freelance, Aluguel, etc.)
- Múltiplas entradas por mês

---

### Combustível
**Rota:** `/dashboard/combustivel`

- Registro de abastecimentos com data, litros, preço/litro, km
- Cálculo automático de eficiência

---

### Metas e Orçamento
**Rota:** `/dashboard/metas`

- Definição de limite por categoria (Cartões, Fixas, Combustível, Total)
- Alertas de % de consumo do orçamento
- Notificação quando próximo do limite

---

### Relatórios
**Rota:** `/dashboard/relatorios`

Atualizado na Fase 3:
- Filtros de período: Mês, Trimestre, Semestre, Ano, Personalizado
- Exportação **PDF** (via impressão do navegador)
- Exportação **CSV** e **JSON**
- Gráfico de evolução mensal e distribuição por categoria
- **🆕 Projeção dos próximos 3 meses** com base na média histórica

---

### Notificações
**Rota:** `/dashboard/notificacoes`

- Lembretes de vencimentos
- Alertas de metas atingidas

---

### 🆕 Open Finance (Simulador)
**Rota:** `/dashboard/open-finance`

Importação de extratos bancários no padrão Open Finance:

**Formatos suportados:**
- **OFX** (Open Financial Exchange) — formato padrão dos bancos brasileiros
- **CSV** — com detecção automática de colunas e separador (`,` ou `;`)

**Bancos reconhecidos automaticamente:**
Bradesco, Itaú, Santander, Nubank, Banco Inter, Caixa Econômica, Banco do Brasil, Sicoob, C6 Bank

**Fluxo:**
1. Upload por arrasto (drag & drop) ou seleção de arquivo
2. Preview dos lançamentos com categorização automática
3. Resumo de créditos e débitos
4. Botão "Sincronizar Tudo": débitos → Contas Fixas, créditos → Entradas
5. Histórico completo de importações

**Categorização automática** por palavras-chave em PT-BR:
Alimentação, Transporte, Saúde, Educação, Lazer, Moradia, Vestuário, Cartão, Salário, Transferência

---

### 🆕 IA Financeira (Gemini)
**Rota:** `/dashboard/ia-analise`

Análise inteligente dos gastos com dois modos:

**Modo Gemini (requer `GOOGLE_AI_KEY`):**
- Análise narrativa completa com insights personalizados
- Considera histórico dos últimos 3 meses
- Identifica padrões e anomalias nos gastos

**Modo Heurístico Local (fallback automático):**
- Funciona sem API externa
- Análise de saldo positivo/negativo
- Alertas de comprometimento de renda por categoria
- Tendências vs. média histórica
- Projeções para o próximo mês
- Identificação do maior gasto no cartão

**Chat com seus gastos:**
- Campo de texto livre para perguntas em linguagem natural
- Exemplos: "Onde estou gastando mais?", "Posso economizar?", "Como está meu saldo?"
- Histórico de conversa na sessão

---

### 🆕 Modo Família/Compartilhado
**Rota:** `/dashboard/familia`

Gerenciamento de orçamento compartilhado:

**Criar grupo:**
- Define nome do grupo
- Gera código de convite único de 8 caracteres

**Entrar em grupo:**
- Insira o código de convite compartilhado pelo dono

**Dashboard Familiar:**
- Totais consolidados do grupo (entradas, saídas, saldo)
- Cards individuais por membro com barras de progresso
- Comparação visual entre membros

**Gerenciar grupo:**
- Código de convite com cópia rápida
- Lista de membros com papéis (Admin/Membro)
- Remoção de membros (apenas Admin/Dono)
- Saída do grupo (membros)

**Permissões:**
- **Admin (Dono):** gerencia membros, vê todos os dados
- **Membro:** visualiza o dashboard familiar, edita apenas seus próprios registros

---

### 🆕 Simulador de Investimentos
**Rota:** `/dashboard/investimentos`

Calculadora de juros compostos com 3 modos:

**Simulação Livre:**
- Valor inicial, aporte mensal, taxa e prazo configuráveis
- Slider de prazo e taxa com benchmarks (Poupança, CDI, IPCA+6%, Ibovespa)

**Meta de Valor:**
- Define valor-alvo e calcula quantos meses para atingir
- Linha de referência no gráfico

**Aposentadoria:**
- Idade atual e idade de aposentadoria
- Renda mensal desejada
- Cálculo do capital necessário

**Resultados exibidos:**
- Valor final acumulado
- Total aportado
- Juros ganhos
- Renda passiva estimada mensal
- Gráfico de evolução com comparação Patrimônio vs. Aportado
- Multiplicador (ex: "3.2x" o capital investido)

---

## Banco de Dados (Supabase)

### Tabelas Existentes (Fase 1+2)

| Tabela | Descrição |
|--------|-----------|
| `cartoes` | Faturas mensais por cartão |
| `lancamentos_cartao` | Lançamentos individuais de cada cartão |
| `contas_fixas` | Contas e despesas fixas mensais |
| `entradas` | Renda e entradas mensais |
| `combustivel` | Registro de abastecimentos |
| `metas` | Limites de orçamento por categoria |
| `lembretes` | Notificações e lembretes |

### Tabelas Novas (Fase 3)

| Tabela | Descrição |
|--------|-----------|
| `grupos_familia` | Grupos familiares com código de convite |
| `membros_familia` | Relação usuário-grupo com papéis |
| `importacoes_ofx` | Registro de arquivos OFX/CSV importados |
| `lancamentos_importados` | Lançamentos individuais das importações |

Todas as tabelas possuem **Row Level Security (RLS)** habilitado — cada usuário vê apenas seus próprios dados.

---

## Variáveis de Ambiente

Arquivo: `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_AQUI

# Google Drive (Service Account)
GOOGLE_PROJECT_ID=seu-projeto-id
GOOGLE_PRIVATE_KEY_ID=abc123...
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=fischer-drive@seu-projeto.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=123456789
GOOGLE_DRIVE_PASTA_CONTAS_2026_ID=1AbCdEfGhIjKlMnOpQrStUvWx

# Google Gemini AI (Fase 3 — opcional)
# Obtenha gratuitamente em: https://aistudio.google.com/app/apikey
GOOGLE_AI_KEY=SUA_CHAVE_GEMINI_AQUI
```

> **Nota:** O sistema funciona sem `GOOGLE_AI_KEY`, usando análise heurística local automaticamente.

---

## Como Executar

```bash
# 1. Instalar dependências
cd fischer-financas
npm install

# 2. Configurar variáveis de ambiente
# Edite o arquivo .env.local com suas credenciais

# 3. Executar migrations no Supabase
# Acesse: https://supabase.com/dashboard → SQL Editor
# Execute MIGRATIONS.sql e depois MIGRATIONS_FASE3.sql

# 4. Iniciar servidor de desenvolvimento
npm run dev

# 5. Acesse: http://localhost:3000
```

---

## Migrations SQL

### Fase 1+2 — `MIGRATIONS.sql`
Execute este arquivo primeiro. Contém:
- Coluna `conferido` em `lancamentos_cartao`
- Tabela `metas`
- Índices de performance
- View `vw_resumo_mensal`
- RLS policies

### Fase 3 — `MIGRATIONS_FASE3.sql`
Execute após o MIGRATIONS.sql. Contém:
- Tabela `grupos_familia` + trigger + RLS
- Tabela `membros_familia` + RLS
- Tabela `importacoes_ofx` + RLS
- Tabela `lancamentos_importados` + RLS

> **Como executar:** Supabase Dashboard → SQL Editor → cole o conteúdo → Run

---

## Obtendo a Chave do Gemini AI

1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Faça login com sua conta Google
3. Clique em "Create API key"
4. Copie a chave gerada
5. Cole em `.env.local` na variável `GOOGLE_AI_KEY`
6. Reinicie o servidor: `npm run dev`

> **Plano gratuito:** 15 RPM (requests por minuto) e 1M tokens/dia — mais do que suficiente para uso pessoal.

---

*Fischer Finanças — Sistema completo de gestão financeira pessoal e familiar*
