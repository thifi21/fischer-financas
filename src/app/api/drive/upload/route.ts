import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

// ── Configuração da Service Account ─────────────────────────────
// As credenciais vêm das variáveis de ambiente da Vercel
function getAuth() {
  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    token_uri: 'https://oauth2.googleapis.com/token',
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })
}

// ── Nomes dos meses em português (igual às pastas do Drive) ──────
const MESES_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// ── Busca ou cria uma pasta pelo nome dentro de um pai ──────────
async function buscarOuCriarPasta(
  drive: any,
  nome: string,
  paiId: string
): Promise<string> {
  // Tenta encontrar pasta existente
  const res = await drive.files.list({
    q: `name='${nome}' and mimeType='application/vnd.google-apps.folder' and '${paiId}' in parents and trashed=false`,
    fields: 'files(id,name)',
    spaces: 'drive',
  })

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id as string
  }

  // Cria se não existir
  const created = await drive.files.create({
    requestBody: {
      name: nome,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [paiId],
    },
    fields: 'id',
  })

  return created.data.id as string
}

// ── Formata nome do arquivo ──────────────────────────────────────
function formatarNomeArquivo(
  descricao: string,
  valor: number,
  extensao: string,
  data?: string
): string {
  const hoje = data ?? new Date().toISOString().split('T')[0]
  const desc = descricao
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos
    .replace(/[^a-zA-Z0-9\s]/g, '')    // remove caracteres especiais
    .replace(/\s+/g, '_')
    .substring(0, 40)
  const valorStr = `R$${valor.toFixed(0)}`
  return `${hoje}_${desc}_${valorStr}.${extensao}`
}

// ── POST /api/drive/upload ───────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Verifica se as credenciais estão configuradas
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: 'Google Drive não configurado. Adicione as variáveis de ambiente.' },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const arquivo  = formData.get('arquivo') as File | null
    const mes      = parseInt(formData.get('mes') as string)
    const descricao = formData.get('descricao') as string
    const valor    = parseFloat(formData.get('valor') as string)

    if (!arquivo || !mes || !descricao) {
      return NextResponse.json({ error: 'Parâmetros inválentes.' }, { status: 400 })
    }

    // Valida tipo de arquivo
    const tiposPermitidos = ['image/jpeg','image/png','image/webp','application/pdf']
    if (!tiposPermitidos.includes(arquivo.type)) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use PDF, JPG ou PNG.' },
        { status: 400 }
      )
    }

    // Valida tamanho (máx 10MB)
    if (arquivo.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 10MB.' },
        { status: 400 }
      )
    }

    // Autenticação Google
    const auth  = getAuth()
    const drive = google.drive({ version: 'v3', auth })

    // ID da pasta raiz "Contas 2026" — vem da variável de ambiente
    const pastaRaizId = process.env.GOOGLE_DRIVE_PASTA_CONTAS_2026_ID

    if (!pastaRaizId) {
      return NextResponse.json(
        { error: 'ID da pasta Contas 2026 não configurado.' },
        { status: 500 }
      )
    }

    // Navega: Contas 2026 > [Mês] > Pagas
    const nomeMes    = MESES_PT[mes - 1]        // ex: "Março"
    const pastaMesId = await buscarOuCriarPasta(drive, nomeMes, pastaRaizId)
    const pastaPagasId = await buscarOuCriarPasta(drive, 'Pagas', pastaMesId)

    // Monta nome do arquivo
    const extensao = arquivo.name.split('.').pop() ?? 'pdf'
    const nomeArquivo = formatarNomeArquivo(descricao, valor, extensao)

    // Converte File para Buffer
    const bytes  = await arquivo.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Faz upload para o Drive
    const { Readable } = require('stream')
    const stream = Readable.from(buffer)

    const uploaded = await drive.files.create({
      requestBody: {
        name: nomeArquivo,
        parents: [pastaPagasId],
      },
      media: {
        mimeType: arquivo.type,
        body: stream,
      },
      fields: 'id,name,webViewLink,webContentLink',
    })

    const fileId   = uploaded.data.id
    const viewLink = uploaded.data.webViewLink

    return NextResponse.json({
      sucesso: true,
      arquivo: {
        id: fileId,
        nome: nomeArquivo,
        link: viewLink,
        pasta: `Contas 2026 / ${nomeMes} / Pagas`,
      },
    })

  } catch (err: any) {
    console.error('Erro Drive upload:', err)
    return NextResponse.json(
      { error: err.message ?? 'Erro interno ao fazer upload.' },
      { status: 500 }
    )
  }
}

// ── GET /api/drive/upload — lista comprovantes de um mês ─────────
export async function GET(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({ arquivos: [] })
    }

    const { searchParams } = new URL(req.url)
    const mes = parseInt(searchParams.get('mes') ?? '1')

    const auth  = getAuth()
    const drive = google.drive({ version: 'v3', auth })

    const pastaRaizId  = process.env.GOOGLE_DRIVE_PASTA_CONTAS_2026_ID
    if (!pastaRaizId) return NextResponse.json({ arquivos: [] })

    const nomeMes = MESES_PT[mes - 1]

    // Busca pasta do mês
    const resMes = await drive.files.list({
      q: `name='${nomeMes}' and mimeType='application/vnd.google-apps.folder' and '${pastaRaizId}' in parents and trashed=false`,
      fields: 'files(id)',
    })
    if (!resMes.data.files?.length) return NextResponse.json({ arquivos: [] })

    const mestId = resMes.data.files[0].id as string

    // Busca pasta Pagas
    const resPagas = await drive.files.list({
      q: `name='Pagas' and mimeType='application/vnd.google-apps.folder' and '${mestId}' in parents and trashed=false`,
      fields: 'files(id)',
    })
    if (!resPagas.data.files?.length) return NextResponse.json({ arquivos: [] })

    const pagasId = resPagas.data.files[0].id as string

    // Lista arquivos dentro de Pagas
    const resArq = await drive.files.list({
      q: `'${pagasId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,webViewLink,createdTime,size)',
      orderBy: 'createdTime desc',
    })

    return NextResponse.json({ arquivos: resArq.data.files ?? [] })

  } catch (err: any) {
    console.error('Erro Drive list:', err)
    return NextResponse.json({ arquivos: [] })
  }
}
