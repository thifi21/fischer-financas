import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'

/**
 * Fischer Finanças 2026 — API Google Drive
 * Desenvolvido por Thiago Fischer
 *
 * Usa Service Account para upload de comprovantes.
 * A pasta "Contas 2026" deve estar compartilhada com o
 * client_email da service account como Editor.
 */

const MESES_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// ── Monta autenticação via Service Account ───────────────────────
function getAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  return new google.auth.GoogleAuth({
    credentials: {
      type:                        'service_account',
      project_id:                  process.env.GOOGLE_PROJECT_ID,
      private_key_id:              process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key:                 privateKey,
      client_email:                process.env.GOOGLE_CLIENT_EMAIL,
      client_id:                   process.env.GOOGLE_CLIENT_ID,
      token_uri:                   'https://oauth2.googleapis.com/token',
    } as any,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
}

// ── Busca pasta por nome dentro de um pai ────────────────────────
// Usa supportsAllDrives para funcionar em pastas compartilhadas
async function buscarPasta(
  drive: any,
  nome: string,
  paiId: string
): Promise<string | null> {
  const res = await drive.files.list({
    q: `name='${nome}' and mimeType='application/vnd.google-apps.folder' and '${paiId}' in parents and trashed=false`,
    fields: 'files(id,name)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })
  return res.data.files?.[0]?.id ?? null
}

// ── Cria pasta dentro de um pai ──────────────────────────────────
async function criarPasta(
  drive: any,
  nome: string,
  paiId: string
): Promise<string> {
  const res = await drive.files.create({
    requestBody: {
      name:     nome,
      mimeType: 'application/vnd.google-apps.folder',
      parents:  [paiId],
    },
    fields: 'id',
    supportsAllDrives: true,
  })
  return res.data.id as string
}

// ── Busca ou cria pasta ──────────────────────────────────────────
async function buscarOuCriar(drive: any, nome: string, paiId: string): Promise<string> {
  const existente = await buscarPasta(drive, nome, paiId)
  return existente ?? await criarPasta(drive, nome, paiId)
}

// ── Formata nome do arquivo para o Drive ─────────────────────────
function formatarNome(descricao: string, valor: number, extensao: string): string {
  const hoje = new Date().toISOString().split('T')[0]
  const desc = descricao
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 40)
  return `${hoje}_${desc}_R$${valor.toFixed(0)}.${extensao}`
}

// ── POST /api/drive/upload — faz upload do comprovante ───────────
export async function POST(req: NextRequest) {
  try {
    // Verifica configuração
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Google Drive não configurado. Adicione as variáveis de ambiente na Vercel.' },
        { status: 500 }
      )
    }

    const pastaRaizId = process.env.GOOGLE_DRIVE_PASTA_CONTAS_2026_ID
    if (!pastaRaizId) {
      return NextResponse.json(
        { error: 'ID da pasta Contas 2026 não configurado.' },
        { status: 500 }
      )
    }

    // Lê o formulário
    const formData  = await req.formData()
    const arquivo   = formData.get('arquivo') as File | null
    const mes       = parseInt(formData.get('mes') as string)
    const descricao = formData.get('descricao') as string
    const valor     = parseFloat(formData.get('valor') as string) || 0

    if (!arquivo || !mes || !descricao) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
    }

    // Valida tipo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!tiposPermitidos.includes(arquivo.type)) {
      return NextResponse.json({ error: 'Formato não suportado. Use PDF, JPG ou PNG.' }, { status: 400 })
    }

    // Valida tamanho (10MB)
    if (arquivo.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande. Máximo 10MB.' }, { status: 400 })
    }

    // Autentica
    const auth  = getAuth()
    const drive = google.drive({ version: 'v3', auth })

    // Navega: Contas 2026 → [Mês] → Pagas
    // Todas as operações com supportsAllDrives=true para funcionar em
    // pastas compartilhadas com a service account
    const nomeMes      = MESES_PT[mes - 1]
    const pastaMesId   = await buscarOuCriar(drive, nomeMes, pastaRaizId)
    const pastaPagasId = await buscarOuCriar(drive, 'Pagas', pastaMesId)

    // Prepara arquivo
    const extensao    = arquivo.name.split('.').pop()?.toLowerCase() ?? 'pdf'
    const nomeArquivo = formatarNome(descricao, valor, extensao)
    const bytes       = await arquivo.arrayBuffer()
    const stream      = Readable.from(Buffer.from(bytes))

    // Faz upload com supportsAllDrives=true
    const uploaded = await drive.files.create({
      requestBody: {
        name:    nomeArquivo,
        parents: [pastaPagasId],
      },
      media: {
        mimeType: arquivo.type,
        body:     stream,
      },
      fields:            'id,name,webViewLink',
      supportsAllDrives: true,
    })

    return NextResponse.json({
      sucesso: true,
      arquivo: {
        id:    uploaded.data.id,
        nome:  nomeArquivo,
        link:  uploaded.data.webViewLink,
        pasta: `Contas 2026 / ${nomeMes} / Pagas`,
      },
    })
  } catch (err: any) {
    console.error('[Drive Upload] Erro:', err?.message ?? err)

    // Mensagem amigável para erros comuns
    let mensagem = err?.message ?? 'Erro ao fazer upload.'

    if (mensagem.includes('storage quota')) {
      mensagem = 'A pasta não está compartilhada corretamente com a service account. Verifique o Passo 5 do tutorial.'
    } else if (mensagem.includes('File not found') || mensagem.includes('notFound')) {
      mensagem = 'Pasta "Contas 2026" não encontrada. Verifique o ID em GOOGLE_DRIVE_PASTA_CONTAS_2026_ID.'
    } else if (mensagem.includes('invalid_grant') || mensagem.includes('unauthorized')) {
      mensagem = 'Credenciais inválidas. Verifique GOOGLE_PRIVATE_KEY e GOOGLE_CLIENT_EMAIL.'
    } else if (mensagem.includes('insufficientPermissions')) {
      mensagem = 'Sem permissão de escrita. Compartilhe a pasta com permissão de Editor.'
    }

    return NextResponse.json({ error: mensagem }, { status: 500 })
  }
}

// ── GET /api/drive/upload — lista comprovantes do mês ───────────
export async function GET(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({ arquivos: [], configurado: false })
    }

    const pastaRaizId = process.env.GOOGLE_DRIVE_PASTA_CONTAS_2026_ID
    if (!pastaRaizId) return NextResponse.json({ arquivos: [] })

    const mes     = parseInt(new URL(req.url).searchParams.get('mes') ?? '1')
    const auth    = getAuth()
    const drive   = google.drive({ version: 'v3', auth })
    const nomeMes = MESES_PT[mes - 1]

    // Busca pasta do mês
    const mesId = await buscarPasta(drive, nomeMes, pastaRaizId)
    if (!mesId) return NextResponse.json({ arquivos: [] })

    // Busca pasta Pagas
    const pagasId = await buscarPasta(drive, 'Pagas', mesId)
    if (!pagasId) return NextResponse.json({ arquivos: [] })

    // Lista arquivos
    const res = await drive.files.list({
      q:         `'${pagasId}' in parents and trashed=false`,
      fields:    'files(id,name,mimeType,webViewLink,createdTime,size)',
      orderBy:   'createdTime desc',
      supportsAllDrives:        true,
      includeItemsFromAllDrives: true,
    })

    return NextResponse.json({ arquivos: res.data.files ?? [] })
  } catch (err: any) {
    console.error('[Drive List] Erro:', err?.message ?? err)
    return NextResponse.json({ arquivos: [] })
  }
}
