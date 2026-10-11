/**
 * Logger estruturado (JSON em uma linha) para APIs e crons.
 * Facilita busca/filtro nos logs da Vercel e pode ser encaminhado
 * para Sentry/Datadog depois, sem alterar os pontos de chamada.
 */

type Nivel = 'info' | 'warn' | 'error'
type Contexto = Record<string, unknown>

function serializarErro(err: unknown): Contexto {
  if (err instanceof Error) {
    return { erro: err.message, stack: err.stack?.split('\n').slice(0, 5).join('\n') }
  }
  return { erro: String(err) }
}

function emitir(nivel: Nivel, escopo: string, mensagem: string, ctx?: Contexto) {
  const linha = JSON.stringify({
    ts: new Date().toISOString(),
    nivel,
    escopo,
    mensagem,
    ...ctx,
  })
  if (nivel === 'error') console.error(linha)
  else if (nivel === 'warn') console.warn(linha)
  else console.log(linha)
}

export function criarLogger(escopo: string) {
  return {
    info: (mensagem: string, ctx?: Contexto) => emitir('info', escopo, mensagem, ctx),
    warn: (mensagem: string, ctx?: Contexto) => emitir('warn', escopo, mensagem, ctx),
    error: (mensagem: string, err?: unknown, ctx?: Contexto) =>
      emitir('error', escopo, mensagem, { ...(err !== undefined ? serializarErro(err) : {}), ...ctx }),
  }
}
