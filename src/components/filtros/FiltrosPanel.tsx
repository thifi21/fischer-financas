'use client'
import { useState } from 'react'

export interface FiltrosAvancados {
  dataInicio?: string
  dataFim?: string
  valorMin?: number
  valorMax?: number
  textoBusca?: string
  opcoesSelecionadas?: string[]
  apenasNaoConferidos?: boolean
}

interface FiltrosPanelProps {
  filtros: FiltrosAvancados
  onFiltrosChange: (filtros: FiltrosAvancados) => void
  opcoes?: { value: string; label: string }[]
  opcoesLabel?: string
  mostrarConferidos?: boolean
}

export default function FiltrosPanel({ 
  filtros, 
  onFiltrosChange, 
  opcoes = [],
  opcoesLabel = 'Filtrar por',
  mostrarConferidos = false 
}: FiltrosPanelProps) {
  const [expandido, setExpandido] = useState(false)

  function limparFiltros() {
    onFiltrosChange({})
  }

  function aplicarFiltro(campo: keyof FiltrosAvancados, valor: any) {
    onFiltrosChange({ ...filtros, [campo]: valor })
  }

  const temFiltrosAtivos = Object.values(filtros).some(v => 
    v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  )

  const contadorFiltros = Object.values(filtros).filter(v => 
    v !== undefined && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length

  return (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpandido(!expandido)}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span className="text-lg">{expandido ? '🔽' : '▶️'}</span>
            <span className="font-semibold">Filtros Avançados</span>
            {contadorFiltros > 0 && (
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium">
                {contadorFiltros}
              </span>
            )}
          </button>
        </div>
        
        {temFiltrosAtivos && (
          <button 
            onClick={limparFiltros}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
          >
            🗑️ Limpar Filtros
          </button>
        )}
      </div>

      {expandido && (
        <div className="space-y-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Busca por Texto */}
          <div>
            <label className="label">🔍 Buscar</label>
            <input
              type="text"
              className="input"
              placeholder="Digite para buscar..."
              value={filtros.textoBusca || ''}
              onChange={e => aplicarFiltro('textoBusca', e.target.value)}
            />
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">📅 Data Início</label>
              <input
                type="date"
                className="input"
                value={filtros.dataInicio || ''}
                onChange={e => aplicarFiltro('dataInicio', e.target.value)}
              />
            </div>
            <div>
              <label className="label">📅 Data Fim</label>
              <input
                type="date"
                className="input"
                value={filtros.dataFim || ''}
                onChange={e => aplicarFiltro('dataFim', e.target.value)}
              />
            </div>
          </div>

          {/* Faixa de Valores */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">💰 Valor Mínimo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="0,00"
                value={filtros.valorMin || ''}
                onChange={e => aplicarFiltro('valorMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="label">💰 Valor Máximo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                placeholder="0,00"
                value={filtros.valorMax || ''}
                onChange={e => aplicarFiltro('valorMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Opções (ex: cartões, categorias) */}
          {opcoes.length > 0 && (
            <div>
              <label className="label">{opcoesLabel}</label>
              <div className="flex flex-wrap gap-2">
                {opcoes.map(opcao => {
                  const selecionado = (filtros.opcoesSelecionadas || []).includes(opcao.value)
                  return (
                    <button
                      key={opcao.value}
                      onClick={() => {
                        const atual = filtros.opcoesSelecionadas || []
                        const nova = selecionado
                          ? atual.filter(v => v !== opcao.value)
                          : [...atual, opcao.value]
                        aplicarFiltro('opcoesSelecionadas', nova.length > 0 ? nova : undefined)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selecionado
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-2 border-blue-500'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-2 border-transparent hover:border-gray-300'
                      }`}
                    >
                      {opcao.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Apenas Não Conferidos */}
          {mostrarConferidos && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="apenasNaoConferidos"
                checked={filtros.apenasNaoConferidos || false}
                onChange={e => aplicarFiltro('apenasNaoConferidos', e.target.checked || undefined)}
                className="w-4 h-4 accent-blue-500"
              />
              <label htmlFor="apenasNaoConferidos" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                Mostrar apenas não conferidos
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
