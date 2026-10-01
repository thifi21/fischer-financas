import { NextRequest, NextResponse } from 'next/server'
import { parseOFX, parseCSV, detectarBanco } from '@/lib/ofx-parser'
import { enforceRateLimit, requireApiUser } from '@/lib/api-auth'
import { createHash, randomUUID } from 'node:crypto'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser(req)
    if (auth.error) return auth.error
    const { supabase, user } = auth
    const limited = await enforceRateLimit(supabase, 'open-finance', 5, 60)
    if (limited) return limited

    const formData = await req.formData()
    const file = formData.get('arquivo') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 413 })
    }

    const content = await file.text()
    const arquivoHash = createHash('sha256').update(content).digest('hex')
    const nomeArquivo = file.name
    const isOFX = nomeArquivo.toLowerCase().endsWith('.ofx') || content.includes('<OFX>')
    const banco = detectarBanco(content, nomeArquivo)

    const lancamentos = isOFX ? parseOFX(content) : parseCSV(content)

    if (lancamentos.length === 0) {
      return NextResponse.json({ error: 'Nenhum lançamento encontrado no arquivo.' }, { status: 422 })
    }
    if (lancamentos.length > 500) {
      return NextResponse.json({ error: 'Arquivo com mais de 500 lançamentos. Divida a importação.' }, { status: 413 })
    }

    // --- NOVO: Categorização Inteligente via IA ---
    // Filtramos apenas o que caiu em "outros" para economizar tokens/tempo
    const lancamentosSemCategoria = lancamentos.filter(l => l.categoria === 'outros')
    
    if (lancamentosSemCategoria.length > 0 && process.env.GOOGLE_AI_KEY) {
      try {
        const { categorizarTransacoesAI } = await import('@/lib/ai-analise')
        const sugestoes = await categorizarTransacoesAI(
          lancamentosSemCategoria.map(l => ({ descricao: l.descricao, valor: l.valor }))
        )
        
        // Aplica as sugestões da IA
        const categoriasPermitidas = new Set([
          'alimentacao', 'transporte', 'saude', 'educacao', 'lazer',
          'moradia', 'vestuario', 'outros',
        ])
        lancamentos.forEach(l => {
          if (l.categoria === 'outros' && categoriasPermitidas.has(sugestoes[l.descricao])) {
            l.categoria = sugestoes[l.descricao]
          }
        })
      } catch (err) {
        console.error('Erro na categorização IA:', err)
      }
    }
    // ----------------------------------------------

    // Salvar importação
    const { data: importacao, error: impErr } = await supabase
      .from('importacoes_ofx')
      .insert({
        user_id: user.id,
        banco,
        arquivo_nome: nomeArquivo,
        arquivo_hash: arquivoHash,
        total_lancamentos: lancamentos.length,
        sincronizados: 0,
        status: 'pendente',
      })
      .select()
      .single()

    if (impErr) {
      if (impErr.code === '23505') return NextResponse.json({ error: 'Este arquivo já foi importado.' }, { status: 409 })
      return NextResponse.json({ error: 'Erro ao salvar importação: ' + impErr.message }, { status: 500 })
    }

    // Salvar lançamentos
    const lancamentosComId = lancamentos.map(l => ({ ...l, id: randomUUID() }))
    const inserts = lancamentosComId.map(l => ({
      id: l.id,
      importacao_id: importacao.id,
      user_id: user.id,
      data_transacao: l.data,
      descricao: l.descricao,
      valor: l.valor,
      tipo: l.tipo,
      categoria: l.categoria,
      destino: 'nao_sincronizado',
      sincronizado: false,
    }))

    const { error: lancErr } = await supabase
      .from('lancamentos_importados')
      .insert(inserts)

    if (lancErr) {
      await supabase.from('importacoes_ofx').delete().eq('id', importacao.id).eq('user_id', user.id)
      return NextResponse.json({ error: 'Erro ao salvar lançamentos: ' + lancErr.message }, { status: 500 })
    }

    return NextResponse.json({
      importacaoId: importacao.id,
      banco,
      total: lancamentos.length,
      lancamentos: lancamentosComId,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiUser(req)
  if (auth.error) return auth.error
  const limited = await enforceRateLimit(auth.supabase, 'open-finance', 5, 60)
  if (limited) return limited
  const id = req.nextUrl.searchParams.get('id') || ''
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 })
  }
  const { data, error } = await auth.supabase.from('importacoes_ofx').delete()
    .eq('id', id).eq('user_id', auth.user.id).eq('status', 'pendente')
    .select('id')
  if (error) return NextResponse.json({ error: 'Não foi possível cancelar a importação' }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: 'Importação pendente não encontrada' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
