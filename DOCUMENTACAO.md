# 📚 Documentação Completa — Fischer Finanças
## Versão 3.6.1 — Propagação Automática de Parcelas & Correções ✅

> Desenvolvido por Thiago Fischer | Versão 3.6.1 | 11/05/2026

---

## 📋 Índice

1. [Visão Geral do Sistema](#visão-geral)
2. [Stack Tecnológica](#stack)
3. [Arquitetura de Estado](#arquitetura-de-estado)
4. [Suporte PWA](#pwa)
5. [Otimização de Performance](#performance)
6. [Segurança](#segurança)
7. [UX & Atalhos](#ux)
8. [Estrutura de Arquivos](#estrutura)
9. [Módulos Implementados](#módulos)
10. [Banco de Dados (Supabase)](#banco-de-dados)
11. [Variáveis de Ambiente](#variáveis-de-ambiente)
12. [Migrations SQL](#migrations-sql)

---

## Visão Geral

Fischer Finanças é uma plataforma de gestão financeira familiar de alta performance. O sistema evoluiu de uma simples planilha para um ecossistema completo com **notificações inteligentes**, **conciliação bancária**, **análise por IA** e **visualização de fluxo de caixa (Sankey)**. Na versão 3.6.1, passou por melhorias significativas na propagação de parcelas automáticas tanto para Cartões de Crédito quanto para Contas Fixas.

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

## Arquitetura de Estado

### MesContext
`src/context/MesContext.tsx` — fonte única de verdade para o mês/ano selecionado na sidebar.
- Todas as páginas usam `const { mes, ano } = useMes()` — sem estado local duplicado.
- `MesProvider` envolve o layout completo, garantindo sincronismo entre sidebar e conteúdo.

### UserContext *(v3.6 — novo)*
`src/context/UserContext.tsx` — resolução centralizada do `userId` autenticado.
- `UserProvider` chama `supabase.auth.getUser()` **uma única vez** por sessão.
- Todas as páginas podem usar `const { userId } = useUser()` sem chamadas redundantes ao Supabase Auth.
- Elimina o padrão anterior de `let cachedUserId` global (risco de vazamento entre sessões).

### Padrão de Carregamento de Dados
Cada página implementa:
```ts
const gen = ++loadGenRef.current   // Geração de carga
// ... await Promise.all([...queries...])
if (gen !== loadGenRef.current) return  // Descarta respostas obsoletas
```
Isso evita **race conditions** ao navegar rapidamente entre meses.

### Supabase Client
O cliente Supabase é instanciado via `useMemo` em cada página:
```ts
const supabase = useMemo(() => createClient(), [])
```
Garante uma única instância por ciclo de vida do componente — sem re-conexões WebSocket.

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
- **Memoização**: `useMemo` para cálculos e clientes — evita re-computações desnecessárias.
- **Clock Isolado**: Componente `<Clock />` separado do layout — apenas ele re-renderiza por segundo.
- **formatBRL Singleton**: `Intl.NumberFormat` instanciado uma única vez em módulo — sem alocação por chamada.
- **QueryClient**: `staleTime: 5min` + `refetchOnWindowFocus: false` configurados globalmente.

---

## Segurança

### Rate Limiting (v3.6)
A rota `/api/chat` limita a **20 requisições por minuto por IP**:
- Usa `Map` em memória com janela deslizante de 60 segundos.
- Retorna HTTP 429 ao exceder o limite.
- Protege contra abuso e custos inesperados com a API Gemini.

### HTTP Security Headers (v3.6)
Configurados em `next.config.js` para todas as rotas:

| Header | Valor | Proteção |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Privacidade |
| `Permissions-Policy` | `camera=(), microphone=(self), geolocation=()` | APIs sensíveis |

### Isolamento de Sessão (v3.6)
- Removidas todas as variáveis globais `let cachedUserId` dos módulos.
- Cada sessão de usuário é completamente isolada via `UserContext`.

---

## UX & Atalhos (v3.6)

### Atalhos de Teclado
| Atalho | Ação |
|--------|------|
| `←` | Mês anterior |
| `→` | Mês seguinte |
| `Alt + ←` | Ano anterior |
| `Alt + →` | Próximo ano |

> **Nota:** Os atalhos são ignorados quando o foco está em `<input>`, `<textarea>` ou `<select>`.

### Badge "Hoje" na Sidebar
- O mês/ano atual é destacado com badge **"Hoje"** verde na árvore de período.
- Quando o mês está ativo (selecionado), o badge fica branco sobre fundo azul.

---

## Módulos Implementados

### Dashboard Principal
**Novo Recurso: Sankey Flow**
Localizado no Dashboard, o gráfico de Sankey (`src/components/SankeyFlow.tsx`) oferece uma visualização animada de como a receita é distribuída entre:
- Cartões de Crédito
- Contas Fixas
- Combustível
- Reserva/Sobra

### Cartões de Crédito e Contas Fixas (v3.6.1)
**Propagação Automática de Parcelas:**
- **Cartões de Crédito**: Ao lançar uma compra parcelada (ex: `01/12`), o sistema normaliza os dados e cria automaticamente as faturas dos meses subsequentes. Trata falhas parciais (via `try/catch`) e notifica no final (Toast).
- **Contas Fixas**: Contas registradas com campo parcela (ex: `01/10`) geram automaticamente os registros para os próximos meses, avançando o mês de vencimento (mantendo o dia).
- **Preview Dinâmico**: O modal exibe em tempo real a lista dos meses seguintes e as respectivas parcelas que serão geradas antes de confirmar o salvamento.

### Extrato & Conciliação
**Rota:** `/dashboard/entradas` (Aba Extrato)
- Interface unificada para todas as movimentações.
- **Sistema de Check:** Marcação visual de itens conferidos.
- **Saldo Dinâmico:** Atualizado em tempo real conforme filtros e conferências.
- **Exclusão Local (Ocultar):** Remove lançamentos da visão de extrato sem deletar o registro.

### Notificações (Telegram)
**Integração Fase 6:**
- Envio automático de mensagens via Bot sempre que um pagamento é registrado.
- Formatação em HTML com emojis e valores destacados.
- Webhook configurado em `src/app/api/telegram/route.ts`.

### IA Financeira (Fischer AI)
**Rota:** `/api/chat`
- Chat inteligente via Google Gemini 1.5 Flash.
- Suporte a texto e áudio (Web Speech API).
- Rate limiting de 20 req/min por IP.
- Singleton `GoogleGenerativeAI` reutilizado entre requisições warm.
- Cleanup do `SpeechRecognition` ao desmontar o componente.

### Sonhos e Objetivos
**Rota:** `/dashboard/sonhos`
- Gestão de metas de médio/longo prazo.
- Barra de progresso percentual e cálculo de "Quanto falta".
- Status de prioridade e categoria.

### Metas e Orçamento
**Rota:** `/dashboard/metas`
- Definição de limites mensais por categoria (Cartões, Fixas, Combustível, Total).
- Alertas visuais ao atingir o percentual configurado.
- Toggle de ativa/inativa por meta.

---

## Banco de Dados (Supabase)

### Migrations por Fase
O banco de dados deve ser atualizado seguindo a ordem das migrations na pasta `supabase/migrations/`:
1. `001_schema.sql`: Base do sistema.
2. `MIGRATIONS_FASE3.sql`: Família, Open Finance e IA.
3. `MIGRATIONS_FASE4.sql`: Módulo de Sonhos.
4. `MIGRATIONS_FASE5_EXTRATO.sql`: Suporte a Conciliação (Coluna `conferido`).
5. `005_add_oculto_extrato.sql`: Coluna `oculto_extrato` para exclusão local.

### Índices Recomendados
Para melhorar a performance das queries mais frequentes `(user_id, mes, ano)`:
```sql
CREATE INDEX IF NOT EXISTS idx_cartoes_user_mes_ano
  ON cartoes(user_id, mes, ano);
CREATE INDEX IF NOT EXISTS idx_lancamentos_user_mes_ano
  ON lancamentos_cartao(user_id, mes, ano);
CREATE INDEX IF NOT EXISTS idx_contas_fixas_user_mes_ano
  ON contas_fixas(user_id, mes, ano);
CREATE INDEX IF NOT EXISTS idx_entradas_user_mes_ano
  ON entradas(user_id, mes, ano);
```

---

## Variáveis de Ambiente

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

*Fischer Finanças 2026 — Documentação Técnica v3.6.1*
