const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function load(modulePath, environment = {}) {
  const source = readFileSync(path.join(__dirname, '..', modulePath), 'utf8')
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
  } }).outputText
  const exports = {}
  const requireMock = name => name === 'next/server'
    ? { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } }
    : name === '@supabase/supabase-js' ? {}
      : name === './integration-access' ? load('src/lib/integration-access.ts', environment) : require(name)
  vm.runInNewContext(compiled, {
    exports, require: requireMock, process: { env: environment }, console,
  })
  return exports
}

test('integrações exigem lista de usuários configurada e autorização', () => {
  assert.equal(load('src/lib/api-auth.ts').requireIntegrationUser('outro').status, 503)
  const id = '16de90b5-3382-4573-8e1f-53a09d187e77'
  const auth = load('src/lib/api-auth.ts', { INTEGRATIONS_ALLOWED_USER_IDS: id })
  assert.equal(auth.requireIntegrationUser('outro').status, 403)
  assert.equal(auth.requireIntegrationUser(id), null)
})

test('limite distribuído falha fechado se o banco não responder', async () => {
  const { enforceRateLimit } = load('src/lib/api-auth.ts')
  const failed = { rpc: async () => ({ error: { message: 'indisponível' } }) }
  const denied = { rpc: async () => ({ data: false, error: null }) }
  const allowed = { rpc: async () => ({ data: true, error: null }) }
  assert.equal((await enforceRateLimit(failed, 'chat', 20)).status, 503)
  assert.equal((await enforceRateLimit(denied, 'chat', 20)).status, 429)
  assert.equal(await enforceRateLimit(allowed, 'chat', 20), null)
})

test('CSV escapa aspas e neutraliza fórmulas em campos de texto', () => {
  const { csvRow } = load('src/lib/csv.ts')
  assert.equal(csvRow(['=1+1', 'Loja "A", B', -25]), '"\'=1+1","Loja ""A"", B","-25"\n')
})
