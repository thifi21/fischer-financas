import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit, requireApiUser } from '@/lib/api-auth'

// GET: listar grupo e membros do user
export async function GET(req: NextRequest) {
  const auth = await requireApiUser(req)
  if (auth.error) return auth.error
  const { supabase, user } = auth
  const limited = await enforceRateLimit(supabase, 'familia-read', 60, 60)
  if (limited) return limited

  // Grupos que o user é dono OU membro
  const { data: membros } = await supabase
    .from('membros_familia')
    .select('grupo_id')
    .eq('user_id', user.id)

  const grupoIds = membros?.map(m => m.grupo_id) || []

  const { data: grupos } = await supabase
    .from('grupos_familia')
    .select('*')
    .or(`dono_id.eq.${user.id}${grupoIds.length > 0 ? `,id.in.(${grupoIds.join(',')})` : ''}`)

  if (!grupos || grupos.length === 0) return NextResponse.json({ grupo: null, membros: [] })

  const grupo = grupos[0]

  const { data: todosMembros } = await supabase
    .from('membros_familia')
    .select('*')
    .eq('grupo_id', grupo.id)

  const mes = Number(req.nextUrl.searchParams.get('mes'))
  const ano = Number(req.nextUrl.searchParams.get('ano'))
  let resumos: unknown[] = []
  if (mes >= 1 && mes <= 12 && ano >= 2000 && ano <= 2100) {
    const { data, error: resumoError } = await supabase.rpc('get_resumo_familia', {
      p_mes: mes,
      p_ano: ano,
    })
    if (resumoError) {
      console.error('[Família] Resumo:', resumoError.message)
      return NextResponse.json(
        { error: 'Resumo familiar indisponível. Aplique as migrations do Supabase.' },
        { status: 503 }
      )
    }
    resumos = data || []
  }

  return NextResponse.json({ grupo, membros: todosMembros || [], resumos })
}

// POST: criar grupo
export async function POST(req: NextRequest) {
  const auth = await requireApiUser(req)
  if (auth.error) return auth.error
  const { supabase, user } = auth
  const limited = await enforceRateLimit(supabase, 'familia-write', 20, 60)
  if (limited) return limited

  const body = await req.json()
  const { acao } = body

  if (acao === 'criar') {
    const { nome } = body
    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.trim().length > 80)
      return NextResponse.json({ error: 'Nome do grupo inválido' }, { status: 400 })
    const { data, error: err } = await supabase
      .rpc('criar_grupo_familia', { p_nome: nome.trim() })

    if (err) return NextResponse.json({ error: 'Não foi possível criar o grupo. Verifique a migração do banco.' }, { status: 500 })

    return NextResponse.json({ grupo: data })
  }

  if (acao === 'entrar') {
    const { codigo } = body
    if (typeof codigo !== 'string' || !/^[a-f0-9]{32}$/i.test(codigo.trim()))
      return NextResponse.json({ error: 'Código de convite inválido' }, { status: 400 })

    const { data: grupo, error: gErr } = await supabase
      .rpc('entrar_grupo_familia', { p_codigo: codigo.trim() })

    if (gErr || !grupo)
      return NextResponse.json({ error: 'Código de convite inválido' }, { status: 404 })

    return NextResponse.json({ grupo })
  }

  if (acao === 'sair') {
    const { grupoId } = body
    await supabase
      .from('membros_familia')
      .delete()
      .eq('grupo_id', grupoId)
      .eq('user_id', user.id)

    return NextResponse.json({ ok: true })
  }

  if (acao === 'remover_membro') {
    const { grupoId, membroId } = body
    // Apenas o dono pode remover
    const { data: grupo } = await supabase
      .from('grupos_familia')
      .select('dono_id')
      .eq('id', grupoId)
      .single()

    if (grupo?.dono_id !== user.id)
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    await supabase
      .from('membros_familia')
      .delete()
      .eq('grupo_id', grupoId)
      .eq('user_id', membroId)

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}

// DELETE: deletar grupo (apenas dono)
export async function DELETE(req: NextRequest) {
  const auth = await requireApiUser(req)
  if (auth.error) return auth.error
  const { supabase, user } = auth
  const limited = await enforceRateLimit(supabase, 'familia-write', 20, 60)
  if (limited) return limited

  const { grupoId } = await req.json()
  const { data: grupo } = await supabase
    .from('grupos_familia')
    .select('dono_id')
    .eq('id', grupoId)
    .single()

  if (grupo?.dono_id !== user.id)
    return NextResponse.json({ error: 'Apenas o dono pode deletar o grupo' }, { status: 403 })

  await supabase.from('grupos_familia').delete().eq('id', grupoId)
  return NextResponse.json({ ok: true })
}
