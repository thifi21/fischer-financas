import { NextRequest, NextResponse } from 'next/server'
import { parseOFX, parseCSV, parsePDFText, detectarBanco } from '@/lib/ofx-parser'
import { enforceRateLimit, requireApiUser } from '@/lib/api-auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiUser(req)
    if (auth.error) return auth.error
    const { supabase, user } = auth
    const limited = await enforceRateLimit(user.id, 'open-finance', 5, 60)
    if (limited) return limited

    const formData = await req.formData()
    const file = formData.get('arquivo') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 413 })
    }

    const nomeArquivo = file.name
    const isPDF = nomeArquivo.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'
    let content: string
    if (isPDF) {
      try {
        const { extractText, getDocumentProxy } = await import('unpdf')
        const pdf = await getDocumentProxy(new Uint8Array(await file.arrayBuffer()))
        const { text } = await extractText(pdf, { mergePages: true })
        content = (Array.isArray(text) ? text.join('\n') : text).replace(/\u0000/g, '')
      } catch {
        return NextResponse.json({ error: 'Não foi possível ler o PDF. Ele pode estar protegido por senha ou ser uma imagem escaneada.' }, { status: 422 })
      }
    } else {
      content = (await file.text()).replace(/\u0000/g, '')
    }
    const isOFX = !isPDF && (nomeArquivo.toLowerCase().endsWith('.ofx') || content.includes('<OFX>'))
    const banco = detectarBanco(content, nomeArquivo)

    let lancamentos = isPDF ? parsePDFText(content) : isOFX ? parseOFX(content) : parseCSV(content)

    // Se for PDF e o parser por regex encontrou poucos ou nenhum lançamento (comum em faturas de cartão com layout variado),
    // usa o Gemini AI (quando GOOGLE_AI_KEY estiver configurada) para extrair todas as compras e parcelas.
    if (isPDF && lancamentos.length === 0 && process.env.GOOGLE_AI_KEY) {
      const { extrairLancamentosPDFComIA } = await import('@/lib/ai-analise')
      const viaIA = await extrairLancamentosPDFComIA(content)
      lancamentos = viaIA.map((item, i) => ({
        id: `pdf_ai_${i}_${Date.now()}`,
        ...item,
      }))
    }

    if (lancamentos.length === 0) {
      return NextResponse.json({ error: 'Nenhum lançamento encontrado no arquivo.' }, { status: 422 })
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
        lancamentos.forEach(l => {
          if (l.categoria === 'outros' && sugestoes[l.descricao]) {
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
        total_lancamentos: lancamentos.length,
        sincronizados: 0,
        status: 'pendente',
      })
      .select()
      .single()

    if (impErr) {
      return NextResponse.json({ error: 'Erro ao salvar importação: ' + impErr.message }, { status: 500 })
    }

    // Salvar lançamentos
    const inserts = lancamentos.map(l => ({
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

    const { data: inseridos, error: lancErr } = await supabase
      .from('lancamentos_importados')
      .insert(inserts)
      .select('id, data_transacao, descricao, valor, tipo, categoria')

    if (lancErr || !inseridos) {
      return NextResponse.json({ error: 'Erro ao salvar lançamentos: ' + (lancErr?.message || '') }, { status: 500 })
    }

    const lancamentosComId = inseridos.map((row, idx) => ({
      id: row.id,
      data: row.data_transacao,
      descricao: row.descricao,
      valor: Number(row.valor),
      tipo: row.tipo as 'debito' | 'credito',
      categoria: row.categoria,
      parcela: lancamentos[idx]?.parcela ?? null,
    }))

    return NextResponse.json({
      importacaoId: importacao.id,
      banco,
      total: lancamentosComId.length,
      lancamentos: lancamentosComId,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireApiUser(req)
    if (auth.error) return auth.error
    const { supabase, user } = auth

    const id = req.nextUrl.searchParams.get('id')
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: 'Identificador inválido' }, { status: 400 })
    }

    await supabase.from('lancamentos_importados').delete().eq('importacao_id', id).eq('user_id', user.id)
    const { error } = await supabase.from('importacoes_ofx').delete().eq('id', id).eq('user_id', user.id)
    if (error) {
      return NextResponse.json({ error: 'Não foi possível descartar a importação' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
