# 📚 Documentação Completa — Fischer Finanças
## Versão 3.0 — Fases 4, 5 e 6 Implementadas

> Desenvolvido por Thiago Fischer | Atualizado em 10/04/2026

---

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral)
2. [Stack Tecnológica](#stack)
3. [Estrutura de Arquivos](#estrutura)
4. [Módulos Implementados](#módulos)
   - [Dashboard Principal](#dashboard)
   - [Cartões de Crédito](#cartões)
   - [Contas Fixas](#contas-fixas)
   - [Entradas / Extrato](#entradas)
   - [Combustível](#combustível)
   - [Metas e Orçamento](#metas)
   - [Relatórios](#relatórios)
   - [Notificações (Telegram)](#notificações)
   - [🆕 Sonhos e Objetivos](#sonhos)
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

### Entradas / Extrato da Conta
**Rota:** `/dashboard/entradas`

Este módulo foi modernizado na Fase 5 para atuar como um console de **Conciliação Bancária**:

- **Aba Salários:** Registro de rendas por categoria (Salário, Freelance, Aluguel, etc.).
- **Aba Extrato:** Visão consolidada de todas as movimentações do mês (entradas, fixas, cartões, combustível).
- **🆕 Conciliação (Check):** Botão de check para marcar transações já conferidas no seu extrato real.
- **🆕 Edição Unificada:** Permite editar qualquer lançamento (mesmo uma conta fixa ou abastecimento) diretamente do extrato.
- **🆕 Saldo Progressivo:** Cálculo do saldo real rodando linha a linha.
- **🆕 Movimentação Avulsa:** Adição rápida de itens que só existem no extrato (tarifas, pix rápido).
- **Formatação Brasileira:** Todas as datas seguem o padrão `DD/MM/YYYY`.

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

### Notificações (Telegram)
**Rota:** `/dashboard/notificacoes`

O sistema possui um sistema de notificações híbrido:
- **Lembretes Internos:** Vencimentos e metas exibidos no dashboard.
- **Bot do Telegram:** Notificações em tempo real enviadas para seu celular.

**Recursos do Bot:**
- Notificação automática toda vez que uma Conta Fixa ou Fatura de Cartão é marcada como **"Paga"**.
- Mensagens formatadas com descrição, valor e data do pagamento.
- Evita envios duplicados em caso de edições.

**Como configurar o Telegram:**
1. Crie um Bot via `@BotFather` no Telegram e obtenha o `API TOKEN`.
2. Obtenha seu `CHAT ID` (usando bots como `@userinfobot`).
3. Adicione as chaves no arquivo `.env.local`.

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

### 🆕 Sonhos e Objetivos
**Rota:** `/dashboard/sonhos`

Planejamento financeiro de longo prazo com acompanhamento visual:

- **Metas de Poupança:** Define um valor alvo e o valor já economizado.
- **Priorização:** Classifica sonhos por prioridade (Baixa, Média, Alta).
- **Personalização:** Escolha de ícones e cores para cada objetivo.
- **Progresso:** Barra de progresso automática baseada no valor atual vs. alvo.
- **Status:** Controle de objetivos "Em andamento", "Pausado" ou "Concluído".

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

### Tabelas Novas (Fase 4 e 5)

| Tabela | Descrição |
|--------|-----------|
| `sonhos` | Planejamento de objetivos de longo prazo |
| `grupos_familia` | Grupos familiares com código de convite |
| `membros_familia` | Relação usuário-grupo com papéis |
| `importacoes_ofx` | Registro de arquivos OFX/CSV importados |
| `lancamentos_importados` | Lançamentos individuais das importações |

> **Nota:** As tabelas `entradas`, `contas_fixas`, `cartoes` e `combustivel` agora possuem a coluna `conferido (boolean)` para suporte a conciliação bancária.

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

# Telegram Bot (Fase 6)
TELEGRAM_BOT_TOKEN=seu_token_do_bot_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
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

### Fase 4 — `MIGRATIONS_FASE4.sql`
- Tabela `sonhos` + RLS + Índices.

### Fase 5 — `MIGRATIONS_FASE5_EXTRATO.sql`
- Coluna `conferido` em todas as tabelas de movimentação.
- Índices de performance para conciliação bancária.

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
