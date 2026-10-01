const { test } = require('node:test')
const assert = require('node:assert/strict')
const ts = require('typescript')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

async function carregar(pagina, lancamentos) {
  const source = fs.readFileSync(path.join(__dirname, '../src/app/dashboard', pagina, 'page.tsx'), 'utf8')
  const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let funcao
  function visitar(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === 'carregarTudo') funcao = node.getText(ast)
    ts.forEachChild(node, visitar)
  }
  visitar(ast)
  const atualizacoes = []
  let cartoes
  const cartao = { id: 'hipercard', nome: 'Hipercard', valor: 0 }
  const supabase = { from(tabela) {
    let payload
    const query = {
      select() { return query }, eq() { return query }, order() { return query }, limit() { return query },
      update(valor) { payload = valor; return query },
      then(resolve) {
        if (payload) atualizacoes.push(payload)
        return Promise.resolve({ data: payload ? null : tabela === 'cartoes' ? [cartao] : tabela === 'lancamentos_cartao' ? lancamentos : [], error: null }).then(resolve)
      },
    }
    return query
  } }
  const context = {
    supabase, userIdRef: { current: 'usuario' }, loadGenRef: { current: 0 }, mes: 12, ano: 2026,
    setLoading() {}, setContas() {}, setTotalEntradas() {}, setTodosLancamentos() {}, setSugestoesLocais() {},
    setCartoes(valor) { cartoes = valor }, ORDEM_CARTOES: {}, toast: { error() {} }, console,
  }
  const code = ts.transpileModule(funcao, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText
  await vm.runInNewContext(code + '\ncarregarTudo()', context)
  return { cartoes, atualizacoes }
}

test('Contas Fixas mostra a parcela Hipercard mesmo com total salvo zerado', async () => {
  const { cartoes } = await carregar('contas-fixas', [{ cartao_id: 'hipercard', valor: 154.50 }])
  assert.equal(cartoes[0].valor, 154.50)
})
test('Contas Fixas soma todas as compras sem erro de centavos', async () => {
  const { cartoes } = await carregar('contas-fixas', [{ cartao_id: 'hipercard', valor: 0.1 }, { cartao_id: 'hipercard', valor: 0.2 }])
  assert.equal(cartoes[0].valor, 0.3)
})
test('Cartões executa e aguarda a atualização do total no banco', async () => {
  const { atualizacoes } = await carregar('cartoes', [{ cartao_id: 'hipercard', valor: 154.50 }])
  assert.equal(atualizacoes.length, 1)
  assert.equal(atualizacoes[0].valor, 154.50)
})
