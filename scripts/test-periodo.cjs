const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const vm = require('node:vm')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')

const root = path.resolve(__dirname, '..')
const layoutSource = ts.createSourceFile('layout.tsx', readFileSync(path.join(root, 'src/app/dashboard/layout.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

function compile(source) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2017 },
  }).outputText
}

function mountPeriodo(query, pathname = '/dashboard', fallbackMes = 9, fallbackAno = 2026) {
  const calls = []
  const navigation = {
    useRouter: () => ({ replace: (url, options) => calls.push({ url, options }) }),
    usePathname: () => pathname,
    useSearchParams: () => new URLSearchParams(query),
  }
  const exports = {}
  const source = readFileSync(path.join(root, 'src/context/MesContext.tsx'), 'utf8')
  vm.runInNewContext(compile(source), {
    exports,
    require: name => name === 'next/navigation' ? navigation : require(name),
    URLSearchParams,
    Date,
  })
  let periodo
  function Consumer() {
    periodo = exports.useMes()
    return null
  }
  renderToStaticMarkup(React.createElement(exports.MesProvider, {
    mesInicial: fallbackMes, anoInicial: fallbackAno,
  }, React.createElement(Consumer)))
  return { periodo, calls }
}

// Use the actual sidebar handler, so reintroducing two separate setters fails.
let monthHandler
function findMonthHandler(node) {
  if (ts.isJsxOpeningElement(node) && node.tagName.getText(layoutSource) === 'button') {
    const attrs = node.attributes.properties
    const monthKey = attrs.find(attr => ts.isJsxAttribute(attr) && attr.name.getText(layoutSource) === 'key' && attr.initializer?.getText(layoutSource) === '{m}')
    const click = attrs.find(attr => ts.isJsxAttribute(attr) && attr.name.getText(layoutSource) === 'onClick')
    if (monthKey && click) monthHandler = click.initializer.expression.getText(layoutSource)
  }
  ts.forEachChild(node, findMonthHandler)
}
findMonthHandler(layoutSource)
assert.ok(monthHandler, 'Sidebar month handler must exist')

function selectSidebarMonth(periodo, mes, ano) {
  const source = `const onClick = ${monthHandler}; onClick()`
  vm.runInNewContext(compile(source), { ...periodo, m: mes, a: ano })
}

function expectPeriod(calls, mes, ano, pathname) {
  assert.equal(calls.length, 1, 'Period change must perform exactly one navigation')
  const url = new URL(calls[0].url, 'https://example.test')
  assert.equal(url.pathname, pathname)
  assert.equal(url.searchParams.get('mes'), String(mes))
  assert.equal(url.searchParams.get('ano'), String(ano))
  assert.equal(url.searchParams.get('filtro'), 'pendentes')
  assert.equal(calls[0].options.scroll, false)
  const next = mountPeriodo(url.search.slice(1), pathname).periodo
  assert.equal(next.mes, mes)
  assert.equal(next.ano, ano)
}

for (const pathname of ['/dashboard', '/dashboard/entradas', '/dashboard/contas-fixas', '/dashboard/cartoes', '/dashboard/combustivel']) {
  test(`Sidebar selects every month of 2027 on ${pathname}`, () => {
    for (let mes = 1; mes <= 12; mes++) {
      const { periodo, calls } = mountPeriodo('mes=9&ano=2026&filtro=pendentes', pathname)
      selectSidebarMonth(periodo, mes, 2027)
      expectPeriod(calls, mes, 2027, pathname)
    }
  })
}

const keyboardFunction = layoutSource.statements.find(node => ts.isFunctionDeclaration(node) && node.name?.text === 'useKeyboardNav')
assert.ok(keyboardFunction, 'Keyboard navigation hook must exist')

function pressArrow(periodo, key, altKey = false, tagName = 'BODY') {
  let handler
  let prevented = false
  vm.runInNewContext(compile(`${keyboardFunction.getText(layoutSource)}\nuseKeyboardNav(setPeriodo, mes, ano)`), {
    ...periodo,
    useEffect: effect => effect(),
    document: { addEventListener: (_type, callback) => { handler = callback } },
  })
  handler({ key, altKey, target: { tagName }, preventDefault: () => { prevented = true } })
  return prevented
}

test('Keyboard crosses December 2026 to January 2027 and back', () => {
  for (const [query, key, mes, ano] of [
    ['mes=12&ano=2026&filtro=pendentes', 'ArrowRight', 1, 2027],
    ['mes=1&ano=2027&filtro=pendentes', 'ArrowLeft', 12, 2026],
    ['mes=12&ano=2027&filtro=pendentes', 'ArrowRight', 1, 2028],
  ]) {
    const { periodo, calls } = mountPeriodo(query)
    assert.ok(pressArrow(periodo, key))
    expectPeriod(calls, mes, ano, '/dashboard')
  }
})

test('Keyboard visits all months of 2027 and Alt changes only the year', () => {
  for (let mes = 1; mes <= 12; mes++) {
    const { periodo, calls } = mountPeriodo(`mes=${mes}&ano=2027&filtro=pendentes`)
    pressArrow(periodo, 'ArrowRight')
    expectPeriod(calls, mes === 12 ? 1 : mes + 1, mes === 12 ? 2028 : 2027, '/dashboard')
  }
  const { periodo, calls } = mountPeriodo('mes=9&ano=2026&filtro=pendentes')
  pressArrow(periodo, 'ArrowRight', true)
  expectPeriod(calls, 9, 2027, '/dashboard')
})

test('Keyboard does not change the period while editing a field', () => {
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
    const { periodo, calls } = mountPeriodo('mes=1&ano=2027')
    assert.equal(pressArrow(periodo, 'ArrowLeft', false, tagName), false)
    assert.equal(calls.length, 0)
  }
})

test('Individual setters preserve the other part of the selected period', () => {
  let mounted = mountPeriodo('mes=9&ano=2027&filtro=pendentes')
  mounted.periodo.setMes(12)
  expectPeriod(mounted.calls, 12, 2027, '/dashboard')
  mounted = mountPeriodo('mes=9&ano=2027&filtro=pendentes')
  mounted.periodo.setAno(2028)
  expectPeriod(mounted.calls, 9, 2028, '/dashboard')
})
