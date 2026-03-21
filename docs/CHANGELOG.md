# 📋 Changelog — Fischer Finanças 2026

Todas as mudanças significativas do projeto estão documentadas aqui.

**Desenvolvido por:** Thiago Fischer  
**Projeto:** Fischer Finanças 2026

---

## [1.0.0] — Março 2026

### 🎉 Lançamento inicial

Sistema completo de controle financeiro familiar baseado na planilha `Contas_Família_Fischer_2026.xlsx`.

---

### ✨ Funcionalidades implementadas

#### Autenticação
- Login seguro com email e senha via Supabase Auth
- Botão para mostrar/ocultar senha na tela de login
- Redirecionamento rápido com `router.replace` (sem empilhar histórico)
- Verificação de sessão com cache local — sem dupla requisição ao Supabase
- Botão de dark mode na própria tela de login

#### Dashboard
- Cards de resumo: Entradas, Cartões, Contas Fixas, Total Saídas
- Card de saldo do mês com indicador visual (verde/vermelho)
- Gráfico de pizza — distribuição de gastos do mês
- Gráfico de barras — Entradas vs Saídas por todos os meses do ano
- Barras de progresso por categoria
- Carregamento de todos os 12 meses em paralelo (uma rodada de queries)
- Skeleton animado durante carregamento

#### Cartões de Crédito
- Listagem de todos os cartões do mês com valor total e status (Pago/Pendente)
- Expandir cartão para ver lançamentos detalhados
- Adicionar, editar e excluir lançamentos
- Total do cartão recalculado automaticamente ao alterar lançamentos
- Carregamento paralelo: cartões + todos os lançamentos em 2 queries
- Botão ☁️ para enviar comprovante ao Google Drive

#### Contas Fixas
- Seção **Cartões de Crédito** no topo com totais e status de cada cartão
- Contas agrupadas por categoria com ícones (🏠 🎒 👕 🦷 ⛽ 💰 💪 🏦)
- Contador de itens pagos por grupo
- Rodapé com resumo completo: cartões + fixas + total geral + pago + a pagar
- Marcar cartões como pago/pendente diretamente nesta tela
- Botão ☁️ em cada item para upload de comprovante

#### Entradas / Salários
- Registro de receitas com categorias (Salário, Freelance, Extra, Investimento, Outro)
- Edição inline com botão ✏️ no hover
- Ícones por categoria

#### Combustível
- Registro de abastecimentos com data, litros, valor, KM e preço por litro
- Card de preço médio calculado automaticamente
- Edição com botão ✏️ no hover

#### Google Drive — Comprovantes
- Upload de comprovantes (PDF, JPG, PNG — até 10MB)
- Salvamento automático em `Contas 2026 / [Mês] / Pagas`
- Nome do arquivo gerado automaticamente: `2026-03-20_Nubank_R$957.pdf`
- Painel de comprovantes na sidebar mostrando arquivos do mês ativo
- Arrastar e soltar (drag & drop) no modal de upload
- Preview de imagem antes do envio
- Integração via Service Account (sem login OAuth)

#### Interface
- Tema claro como padrão
- Modo escuro (dark mode) com alternância via botão 🌙/☀️
- Preferência salva no `localStorage` — persiste entre sessões
- Script anti-flash no `<head>` — aplica tema antes da primeira pintura
- Sidebar com navegação, seletor de mês e painel de comprovantes
- Topbar com relógio em tempo real, data e botão Sair
- Fontes aumentadas ~15% em toda a aplicação
- Botões ✏️ e 🗑️ aparecem apenas no hover (menos poluição visual)
- Skeleton animado em todas as páginas
- Modais fecham ao clicar fora
- Botões de salvar desabilitados com campos obrigatórios vazios

#### Performance
- Cache de `userId` em módulo — sem re-fetch em cada operação
- Queries paralelas com `Promise.all` em todas as páginas
- Atualização otimista de state — UI responde antes do banco confirmar
- Recálculo de totais feito localmente sem queries extras

---

### 🗄️ Banco de Dados

#### Tabelas criadas
- `cartoes` — faturas de cartão por mês/ano
- `lancamentos_cartao` — itens detalhados de cada fatura
- `contas_fixas` — contas agrupadas por categoria
- `entradas` — receitas e salários
- `combustivel` — registros de abastecimento

#### Segurança
- Row Level Security (RLS) habilitado em todas as tabelas
- Policies: cada usuário acessa apenas seus próprios dados
- Trigger `update_updated_at` para auditoria de alterações

---

### 📊 Dados importados da planilha

Importação automática via `supabase/migrations/002_seed_dados.sql`:

| Dados | Quantidade |
|---|---|
| Cartões (mês a mês) | 72 registros — Jan a Dez |
| Lançamentos detalhados | 644 itens |
| Contas Fixas | 80 registros — Jan a Jun |
| Abastecimentos | 11 registros — Jan a Mar |
| Entradas / Salários | 2 registros — Março |

Cartões importados: Hipercard, Cartão Caixa, Nubank, Amazon Prime, Mercado Pago, C6 Nara

---

### 🔧 Correções aplicadas

| Problema | Correção |
|---|---|
| Lentidão no login | `router.replace` + `useRef` guard no `getSession` |
| Tema escuro como padrão | Removido `prefers-color-scheme`, padrão forçado claro |
| Vencimento com formato `2025-03-12 00:00:00` | Criada função `formatVencimento()` |
| `setDriveModal` fora do escopo | Arquivos `cartoes` e `contas-fixas` reescritos do zero |
| Painel Drive mostrando `Abril / Pagas` | Simplificado para mostrar apenas o mês |
| Botão Comprovantes longe do seletor | Reposicionado imediatamente abaixo do mês ativo |

---

*Fischer Finanças 2026 — Desenvolvido por **Thiago Fischer***
