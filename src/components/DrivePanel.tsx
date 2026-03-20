'use client'
import { useState, useEffect } from 'react'
import { MESES } from '@/types'

type ArquivoDrive = {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  createdTime: string
  size: string
}

type Props = {
  mes: number
}

export default function DrivePanel({ mes }: Props) {
  const [aberto, setAberto]       = useState(false)
  const [arquivos, setArquivos]   = useState<ArquivoDrive[]>([])
  const [loading, setLoading]     = useState(false)
  const [configurado, setConfigurado] = useState(true)

  useEffect(() => {
    if (aberto) carregarArquivos()
  }, [aberto, mes])

  async function carregarArquivos() {
    setLoading(true)
    try {
      const res  = await fetch(`/api/drive/upload?mes=${mes}`)
      const json = await res.json()
      if (json.error?.includes('configurado')) {
        setConfigurado(false)
      } else {
        setArquivos(json.arquivos ?? [])
        setConfigurado(true)
      }
    } catch {
      setConfigurado(false)
    } finally {
      setLoading(false)
    }
  }

  function iconeArquivo(mime: string) {
    if (mime === 'application/pdf') return '📄'
    if (mime.startsWith('image/'))  return '🖼️'
    return '📎'
  }

  function tamanhoLegivel(bytes: string) {
    const n = parseInt(bytes || '0')
    if (n < 1024) return `${n}B`
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)}KB`
    return `${(n / 1024 / 1024).toFixed(1)}MB`
  }

  return (
    <div className="border-t border-blue-800 dark:border-gray-800">
      {/* Botão Drive na sidebar */}
      <button
        onClick={() => setAberto(v => !v)}
        className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${
          aberto
            ? 'bg-blue-700 dark:bg-gray-800 text-white'
            : 'hover:bg-blue-800 dark:hover:bg-gray-800 text-blue-100 dark:text-gray-300'
        }`}
      >
        {/* Google Drive logo mini */}
        <svg viewBox="0 0 87.3 78" className="w-4 h-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
          <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
          <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
          <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
          <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
          <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
        </svg>
        <span className="flex-1 text-left">Comprovantes</span>
        <span className="text-blue-300 dark:text-gray-500 text-xs">
          {aberto ? '▲' : '▼'}
        </span>
      </button>

      {/* Painel expansível */}
      {aberto && (
        <div className="bg-blue-950/50 dark:bg-gray-900/80 px-3 py-3 space-y-2 max-h-72 overflow-y-auto">
          <div className="text-xs text-blue-300 dark:text-gray-500 px-1 mb-2 flex items-center justify-between">
            <span>📁 {MESES[mes - 1]} / Pagas</span>
            <button
              onClick={carregarArquivos}
              className="text-blue-400 dark:text-gray-600 hover:text-white transition-colors"
              title="Atualizar"
            >↻</button>
          </div>

          {!configurado ? (
            <div className="text-xs text-amber-400 dark:text-amber-500 px-1 py-2 leading-relaxed">
              ⚠️ Drive não configurado.{' '}
              <span className="text-blue-300 dark:text-gray-400">
                Veja o tutorial para adicionar as variáveis de ambiente.
              </span>
            </div>
          ) : loading ? (
            <div className="text-center py-4 text-blue-300 dark:text-gray-500 text-xs">
              <span className="animate-spin inline-block mr-1">⏳</span> Carregando...
            </div>
          ) : arquivos.length === 0 ? (
            <div className="text-center py-4 text-blue-400 dark:text-gray-600 text-xs">
              Nenhum comprovante em {MESES[mes - 1]}
            </div>
          ) : (
            arquivos.map(f => (
              <a
                key={f.id}
                href={f.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-blue-800 dark:hover:bg-gray-800 transition-colors group"
                title={f.name}
              >
                <span className="text-base flex-shrink-0">{iconeArquivo(f.mimeType)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-blue-100 dark:text-gray-300 truncate leading-tight group-hover:text-white">
                    {f.name}
                  </div>
                  <div className="text-xs text-blue-400 dark:text-gray-600">
                    {tamanhoLegivel(f.size)}
                  </div>
                </div>
                <span className="text-blue-400 dark:text-gray-600 group-hover:text-blue-200 text-xs flex-shrink-0">↗</span>
              </a>
            ))
          )}
        </div>
      )}
    </div>
  )
}
