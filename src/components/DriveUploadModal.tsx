'use client'
import { useState, useRef, useCallback } from 'react'
import { formatBRL } from '@/lib/utils'
import { MESES } from '@/types'

type Arquivo = {
  id: string
  nome: string
  link: string
  pasta: string
}

type Props = {
  mes: number
  descricao: string
  valor: number
  onFechar: () => void
  onSucesso?: (arquivo: Arquivo) => void
}

export default function DriveUploadModal({ mes, descricao, valor, onFechar, onSucesso }: Props) {
  const [arquivo, setArquivo]     = useState<File | null>(null)
  const [preview, setPreview]     = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [resultado, setResultado] = useState<Arquivo | null>(null)
  const [erro, setErro]           = useState('')
  const [drag, setDrag]           = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function processarArquivo(f: File) {
    setErro('')
    if (f.size > 10 * 1024 * 1024) {
      setErro('Arquivo muito grande. Máximo 10MB.')
      return
    }
    const tipos = ['image/jpeg','image/png','image/webp','application/pdf']
    if (!tipos.includes(f.type)) {
      setErro('Formato não suportado. Use PDF, JPG ou PNG.')
      return
    }
    setArquivo(f)
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) processarArquivo(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) processarArquivo(f)
  }, [])

  async function handleUpload() {
    if (!arquivo) return
    setUploading(true)
    setErro('')

    try {
      const fd = new FormData()
      fd.append('arquivo',  arquivo)
      fd.append('mes',      String(mes))
      fd.append('descricao', descricao)
      fd.append('valor',    String(valor))

      const res = await fetch('/api/drive/upload', { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok || json.error) {
        setErro(json.error ?? 'Erro ao fazer upload.')
      } else {
        setResultado(json.arquivo)
        onSucesso?.(json.arquivo)
      }
    } catch (e: any) {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  function tamanhoLegivel(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onFechar()}
    >
      <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {/* Google Drive logo SVG */}
            <svg viewBox="0 0 87.3 78" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
              <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
              <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
              <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
            <div>
              <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">Enviar Comprovante</div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {descricao} — {formatBRL(valor)} — {MESES[mes - 1]}
              </div>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >✕</button>
        </div>

        <div className="p-5">
          {/* Sucesso */}
          {resultado ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-4">✅</div>
              <div className="font-bold text-gray-900 dark:text-gray-100 text-base mb-1">
                Comprovante enviado!
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                📁 {resultado.pasta}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-5 font-mono bg-gray-50 dark:bg-gray-800 rounded px-3 py-2 break-all">
                {resultado.nome}
              </div>
              <div className="flex gap-3">
                <a
                  href={resultado.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 text-center"
                >
                  📂 Abrir no Drive
                </a>
                <button className="btn-secondary flex-1" onClick={onFechar}>
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Zona de drop */}
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4
                  ${drag
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : arquivo
                      ? 'border-green-400 bg-green-50 dark:bg-green-950/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
                  }
                `}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={onFileChange}
                />

                {arquivo ? (
                  <div>
                    {/* Preview de imagem */}
                    {preview && (
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-32 mx-auto mb-3 rounded-lg object-contain shadow"
                      />
                    )}
                    {!preview && (
                      <div className="text-4xl mb-2">📄</div>
                    )}
                    <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm truncate px-4">
                      {arquivo.name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {tamanhoLegivel(arquivo.size)} · {arquivo.type.split('/')[1].toUpperCase()}
                    </div>
                    <div className="text-xs text-blue-500 mt-2">Clique para trocar o arquivo</div>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">☁️</div>
                    <div className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                      Arraste o comprovante aqui
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      ou clique para selecionar
                    </div>
                    <div className="text-xs text-gray-300 dark:text-gray-600 mt-3">
                      PDF, JPG, PNG · Máx. 10MB
                    </div>
                  </div>
                )}
              </div>

              {/* Destino no Drive */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="text-base">📁</span>
                <span>
                  Contas 2026 <span className="text-gray-300 dark:text-gray-600 mx-1">/</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{MESES[mes - 1]}</span>
                  <span className="text-gray-300 dark:text-gray-600 mx-1">/</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">Pagas</span>
                </span>
              </div>

              {/* Nome que será dado ao arquivo */}
              {arquivo && (
                <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded px-3 py-2 mb-4 font-mono break-all">
                  {formatarNomePreview(descricao, valor, arquivo.name.split('.').pop() ?? 'pdf')}
                </div>
              )}

              {/* Erro */}
              {erro && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-4 py-3 text-sm mb-4">
                  ⚠️ {erro}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3">
                <button className="btn-secondary flex-1" onClick={onFechar}>
                  Cancelar
                </button>
                <button
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  onClick={handleUpload}
                  disabled={!arquivo || uploading}
                >
                  {uploading ? (
                    <>
                      <span className="animate-spin">⏳</span> Enviando...
                    </>
                  ) : (
                    <>
                      <span>☁️</span> Enviar para Drive
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Gera preview do nome do arquivo igual ao que será salvo
function formatarNomePreview(descricao: string, valor: number, ext: string): string {
  const hoje = new Date().toISOString().split('T')[0]
  const desc = descricao
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 40)
  return `${hoje}_${desc}_R$${valor.toFixed(0)}.${ext}`
}
