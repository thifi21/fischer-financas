import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseOFX, parseCSV, detectarBanco } from '@/lib/ofx-parser'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )

    // Pegar user da sessão via Authorization header
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('arquivo') as File | null
    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
    }

    const content = await file.text()
    const nomeArquivo = file.name
    const isOFX = nomeArquivo.toLowerCase().endsWith('.ofx') || content.includes('<OFX>')
    const banco = detectarBanco(content, nomeArquivo)

    const lancamentos = isOFX ? parseOFX(content) : parseCSV(content)

    if (lancamentos.length === 0) {
      return NextResponse.json({ error: 'Nenhum lançamento encontrado no arquivo.' }, { status: 422 })
    }

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

    const { error: lancErr } = await supabase
      .from('lancamentos_importados')
      .insert(inserts)

    if (lancErr) {
      return NextResponse.json({ error: 'Erro ao salvar lançamentos: ' + lancErr.message }, { status: 500 })
    }

    return NextResponse.json({
      importacaoId: importacao.id,
      banco,
      total: lancamentos.length,
      lancamentos,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro interno' }, { status: 500 })
  }
}
