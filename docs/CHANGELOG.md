# 📋 Changelog — Fischer Finanças 2026

**Desenvolvido por:** Thiago Fischer  
**Projeto:** Fischer Finanças 2026

---

## [3.6.0] — Maio 2026

### 🏗️ Arquitetura

#### UserContext centralizado
- Criado `src/context/UserContext.tsx` com `UserProvider` e hook `useUser()`
- `DashboardLayout` agora envolve toda a aplicação com `UserProvider`
- `userId` resolvido **uma única vez** por sessão de navegação no nível do layout
- Elimina chamadas redundantes a `supabase.auth.getUser()` em cada página

#### MetaCard extraído como componente top-level
- `MetaCard` em `metas/page.tsx` movido para fora do componente pai `MetasPage`
- Funções puras `getCategoriaInfo`, `getPercentual` e `getCorStatus` também movidas para escopo de módulo
- Evita recriação do componente e das funções a cada render do pai

### ⚡ Performance

#### Formatter Singleton
- `formatBRL` em `utils.ts` usa instância única de `Intl.NumberFormat`
- Elimina alocação de nova instância a cada chamada

### 🔐 Segurança

#### Rate Limiting na API de Chat
- Máximo de **20 requisições por minuto por IP** na rota `/api/chat`
- Responde com HTTP 429 ao exceder o limite
- Protege contra uso excessivo e custos inesperados com a API Gemini

#### HTTP Security Headers
- Adicionados cabeçalhos em `next.config.js`:
  - `X-Frame-Options: DENY` — proteção contra clickjacking
  - `X-Content-Type-Options: nosniff` — evita MIME sniffing
  - `Referrer-Policy: strict-origin-when-cross-origin` — privacidade de referência
  - `Permissions-Policy` — desabilita câmera e geolocalização desnecessárias

### 🧑‍💻 UX

#### Atalhos de teclado
- `←` / `→` — navega entre meses
- `Alt+←` / `Alt+→` — navega entre anos
- Ignorado quando o foco está em campos de texto, textarea ou select

#### Badge "Hoje" na sidebar
- Mês atual destacado com badge verde na árvore de período da sidebar
- Quando selecionado, badge fica branco sobre o fundo azul

---

## [3.5.1] — Maio 2026

### 🔴 Correções críticas de bugs

#### BUG 1 — Supabase re-instanciado a cada render
- `createClient()` movido para `useMemo(() => createClient(), [])` em 6 arquivos
- Evita múltiplas conexões WebSocket desnecessárias

#### BUG 2 — Variável global `cachedUserId` vazando entre sessões
- Removida de `cartoes`, `contas-fixas`, `entradas`, `metas`, `relatorios` e `combustivel`
- `useRef(null)` isolado por componente — sem risco de acesso a dados de outro usuário

#### BUG 3/4 — Troca de ano não recarregava dados
- `[mes]` → `[mes, ano]` na dep array dos `useEffect` de recarga em `cartoes`, `contas-fixas` e `combustivel`
- Navegar de 2026 para 2027 agora recarrega corretamente

#### BUG 5 — Propagação de parcelas nos meses seguintes
- **Contas Fixas**: Implementada a lógica de propagação automática de parcelas que estava ausente, avançando a data de vencimento mês a mês.
- **Cartões de Crédito**: Adicionada normalização do campo parcela e tratamento de erro (try/catch) no loop de propagação para evitar falhas silenciosas. Adicionado feedback visual (toast).

#### BUG 6 — Crash silencioso ao criar parcelas futuras
- `novo!.id` substituído por verificação explícita com `throw new Error()`
- Evita `TypeError: Cannot read properties of undefined` em caso de falha do Supabase

#### BUG 7 — Race condition ao trocar mês rapidamente
- Contador `loadGenRef` implementado em `cartoes` e `contas-fixas`
- Respostas de cargas obsoletas são descartadas

#### BUG 8 — `.split('\n')` calculado duas vezes no AIChatBot
- `.map((line, i, arr) => ...)` usa o 3º argumento do map — sem recalcular

#### BUG 9 — SpeechRecognition sem cleanup no AIChatBot
- Cleanup adicionado no `useEffect`: `recognition.abort()` + nullify de todos os handlers
- Evita memory leak ao desmontar o componente

#### BUG 10 — `cache: 'no-store'` em 3 APIs externas no CotacoesPanel
- Alterado para `cache: 'default'` — evita requisições desnecessárias na reabertura do painel

#### BUG 11 — `GoogleGenerativeAI` criado a cada requisição na API chat
- Singleton lazy com `getModel()` — instância reutilizada entre warm starts do serverless

#### BUG 12 — Exclusão de parcelas apagava compras erradas
- Filtro de exclusão agora usa `local + valor + total de parcelas` em vez de apenas `local`

#### PERF 5 — Clock re-renderizava o layout inteiro a cada segundo
- `useClock()` → componente `<Clock />` isolado — apenas o relógio re-renderiza

---

## [1.3.0] — Março 2026

### 🔧 Correções

#### Combustível — lançamentos retroativos
- **Bug corrigido:** ao inserir um abastecimento com data de mês anterior, o sistema salvava com o mês atual (da sidebar) em vez de derivar o mês da data informada
- `mes` e `ano` agora são extraídos diretamente da data digitada (`AAAA-MM-DD`)
- Aviso no modal quando a data pertence a mês diferente do exibido
- Aviso pós-salvo informando em qual mês o registro foi guardado
- Query de carregamento sem filtro de `ano` fixo — registros históricos aparecem corretamente

#### Combustível — campo KM
- **Bug corrigido:** campo KM com `type="number"` aceitava `233.169` como decimal, causando erro `invalid input syntax for type integer` no banco
- Campo trocado para `type="text"` com `inputMode="numeric"`
- Filtro automático no `onChange` remove pontos, vírgulas e letras — aceita `233.169`, `233,169` ou `233169`
- Payload sanitizado com `Math.round(parseInt(...))` antes de enviar ao banco

#### Limpeza de código
- Removidos 3 pacotes npm sem uso: `lucide-react`, `date-fns`, `clsx`
- Removidos 2 exports do `types/index.ts` sem uso: `ResumoMes`, `CATEGORIAS_FIXAS`
- Removido import desnecessário `NOMES_CARTOES` em `contas-fixas/page.tsx`
- Removida pasta vazia `src/app/api/cotacoes/`

---

## [1.2.0] — Março 2026

### ✨ Funcionalidades novas

#### Parcelas automáticas nos cartões
- Ao adicionar um lançamento com parcela (ex: `03/08`), o sistema cria automaticamente as parcelas restantes nos meses seguintes
- Preview em tempo real no modal mostrando quais meses receberão parcelas antes de salvar
- Botão exibe quantidade de parcelas a serem criadas (ex: "Adicionar + 5 parcela(s)")
- Ao excluir: pergunta se exclui só a parcela atual ou todas as parcelas do item
- Formatos aceitos: `01/12`, `1/12`, `01 de 12`, `1 de 12`
- Cria cartão no mês futuro automaticamente se ele ainda não existir

#### Painel de Cotações na sidebar
- Dólar (USD/BRL) — fonte: AwesomeAPI
- Euro (EUR/BRL) — fonte: AwesomeAPI
- PETR4 — fonte: brapi.dev (B3)
- CDI / Meta SELIC — fonte: Banco Central do Brasil
- Variação do dia em % com cor verde (alta) / vermelha (queda)
- Atualiza automaticamente a cada 5 minutos quando painel está aberto
- Sistema de fallback: se a fonte primária falhar, tenta fonte alternativa
- Busca direto no browser (client-side) para evitar limitações serverless
- Ponto verde piscando indica dados ao vivo

### 🔧 Correções

#### Mês ativo persistido entre páginas
- **Bug corrigido:** ao navegar entre telas, cada página reiniciava com o mês atual ignorando a seleção da sidebar
- Criado `src/context/MesContext.tsx` como fonte única de verdade para o mês
- `MesProvider` envolve toda a aplicação (sidebar + conteúdo) no nível do layout
- `DashboardShell` separado para permitir uso de `useMes()` dentro do provider
- Todas as 5 páginas usam `const { mes } = useMes()` em vez de `useState(getMesAtual())`
- Removidos todos os listeners manuais de `mesChange` das páginas
- O mês ativo agora aparece na topbar (ex: `📅 Março 2026`)

#### Ordem personalizada dos cartões
- Sequência definida por Thiago Fischer: `Hipercard → Cartão Crédito Caixa → Nu Bank → C6 Nara → Amazon Prime → Tricard → Mercado Pago → DM Card Koch`
- Exportado `ORDEM_CARTOES` em `types/index.ts` com valores numéricos
- Ordenação feita localmente após fetch — independe da ordem do banco

#### Tricard restaurado
- Cartão Tricard havia sido omitido na importação inicial da planilha
- Adicionado `supabase/migrations/003_tricard_seed.sql` com dados de Jan–Dez 2026

---

## [1.1.0] — Março 2026

### ✨ Funcionalidades novas

#### Google Drive — Comprovantes
- Botão ☁️ em cada cartão (Cartões de Crédito) e em cada item (Contas Fixas) no hover
- Modal com arrastar-e-soltar (drag & drop), preview de imagem e nome automático do arquivo
- Nome gerado: `2026-03-20_Nubank_R$957.pdf`
- Estrutura: `Contas 2026 / [Mês] / Pagas`
- Painel "Comprovantes" na sidebar mostrando arquivos do mês ativo com link direto
- Integração via Service Account (configura uma vez, funciona sempre)
- Parâmetro `supportsAllDrives: true` em todas as operações para funcionar em pastas compartilhadas
- Mensagens de erro amigáveis em português para cada tipo de falha
- Aceita PDF, JPG, PNG — limite de 10MB

#### Botão Sair com confirmação
- Confirmação antes de sair: "Seus dados estão salvos automaticamente"
- Salva timestamp do último acesso no localStorage
- Indicador verde "✓ Dados salvos" na topbar

### 🔧 Correções

#### Tema claro como padrão
- Removido `prefers-color-scheme` do script de tema
- Padrão sempre claro independente do sistema operacional
- Dark mode só ativa se o usuário escolheu explicitamente antes

#### Login mais rápido
- `router.push` substituído por `router.replace` — não empilha histórico
- `useRef(false)` como guard no `getSession` — chamado uma única vez
- Cache de `userId` em módulo — sem re-fetch em cada operação

#### Vencimento corrigido
- Formato `2025-03-12 00:00:00` agora exibe como `12/03`
- Criada função `formatVencimento()` em `utils.ts`
- Aceita qualquer formato de entrada e normaliza para `DD/MM`

---

## [1.0.0] — Março 2026

### 🎉 Lançamento inicial

#### Autenticação
- Login seguro com email e senha via Supabase Auth
- Botão para mostrar/ocultar senha
- Dark mode na tela de login com botão flutuante 🌙/☀️
- Preferência salva no localStorage — persiste entre sessões
- Script anti-flash no `<head>` — aplica tema antes da primeira pintura

#### Dashboard
- Cards de resumo: Entradas, Cartões, Contas Fixas, Total Saídas
- Card de saldo do mês com indicador visual verde/vermelho
- Gráfico de pizza — distribuição de gastos do mês
- Gráfico de barras — Entradas vs Saídas de todos os 12 meses
- Barras de progresso por categoria
- Skeleton animado durante carregamento
- Carregamento paralelo: todos os 12 meses em uma rodada de queries

#### Cartões de Crédito
- Listagem ordenada por sequência personalizada
- Expandir cartão para ver lançamentos detalhados
- Editar e excluir lançamentos com botões no hover
- Total recalculado automaticamente ao alterar lançamentos
- Carregamento paralelo: cartões + lançamentos em 2 queries
- Parcelas exibidas com badge colorido

#### Contas Fixas
- Seção Cartões de Crédito no topo com totais e status
- Contas agrupadas por categoria com ícones por grupo
- Marcação de pago/pendente em cartões e contas fixas
- Rodapé com resumo: total geral, pago, a pagar
- Toggle de expansão da seção de cartões

#### Entradas / Salários
- Categorias com ícones: 💼 Salário, 💻 Freelance, ⭐ Extra, 📈 Investimento
- Edição com botão ✏️ no hover

#### Combustível
- Registro com data, litros, valor, KM e preço/litro
- Card de preço médio calculado automaticamente
- Edição com botão ✏️ no hover

#### Interface
- Tema claro como padrão com toggle 🌙/☀️ na topbar
- Sidebar com navegação, seletor de mês, comprovantes e cotações
- Topbar com relógio em tempo real, data, mês ativo, dados salvos e botão Sair
- Fontes aumentadas ~15% via `tailwind.config.js`
- Botões aparecem no hover — menos poluição visual
- Modais fecham ao clicar fora
- Skeleton animado em todas as páginas

#### Performance
- Cache de `userId` em módulo — sem re-fetch em cada operação
- `Promise.all` em todas as páginas para queries paralelas
- Atualização otimista de state — UI responde antes do banco confirmar
- `useCallback` com parâmetro para evitar closures desatualizados

#### Banco de Dados
- Row Level Security (RLS) em todas as tabelas
- Trigger `update_updated_at` para auditoria
- Importação de 644 lançamentos, 72 cartões, 80 contas fixas, 11 abastecimentos

---

*Fischer Finanças 2026 — Desenvolvido por **Thiago Fischer***
