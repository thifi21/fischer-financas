'use client'
import { useState, useMemo, useEffect } from 'react'
import { formatBRL } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from 'recharts'

type ModoCalc = 'aposentadoria' | 'meta' | 'livre'

function calcularJurosCompostos(
  aporte: number,
  taxa: number,          // % ao mês
  meses: number,
  valorInicial: number = 0
): { mes: number; valor: number; aportado: number }[] {
  const resultado = []
  let acumulado = valorInicial
  const taxaDecimal = taxa / 100

  for (let m = 1; m <= meses; m++) {
    acumulado = acumulado * (1 + taxaDecimal) + aporte
    resultado.push({
      mes: m,
      valor: Math.round(acumulado * 100) / 100,
      aportado: valorInicial + aporte * m,
    })
  }
  return resultado
}

export default function InvestimentosPage() {
  const supabase = useMemo(() => createClient(), [])
  
  const [modo, setModo] = useState<ModoCalc>('livre')

  // Parâmetros do simulador
  const [valorInicial, setValorInicial] = useState(0)
  const [aportesMensal, setAporteMensal] = useState(500)
  const [taxaMensal, setTaxaMensal] = useState(1.0)  // % ao mês (ex: CDI ~1%)
  const [prazoMeses, setPrazoMeses] = useState(60)
  const [metaValor, setMetaValor] = useState(0)

  // Modo Aposentadoria
  const [idadeAtual, setIdadeAtual] = useState(30)
  const [idadeAposentadoria, setIdadeAposentadoria] = useState(60)
  const [rendaDesejada, setRendaDesejada] = useState(5000)

  // Estado das simulações salvas
  const [simulacoes, setSimulacoes] = useState<any[]>([])
  const [nomeSimulacao, setNomeSimulacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [modoComparar, setModoComparar] = useState(false)
  const [simulacoesSelecionadas, setSimulacoesSelecionadas] = useState<string[]>([])

  useEffect(() => {
    carregarSimulacoes()
  }, [])

  async function carregarSimulacoes() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('simulacoes_investimento')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data && !error) setSimulacoes(data)
  }

  async function salvarSimulacao() {
    if (!nomeSimulacao.trim()) {
      toast.error('Dê um nome para a simulação')
      return
    }
    setSalvando(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      user_id: user.id,
      nome: nomeSimulacao,
      modo,
      valor_inicial: valorInicial,
      aporte_mensal: aportesMensal,
      taxa_mensal: taxaMensal,
      prazo_meses: prazoMeses,
      meta_valor: metaValor,
      idade_atual: idadeAtual,
      idade_aposentadoria: idadeAposentadoria,
      renda_desejada: rendaDesejada
    }

    const { error } = await supabase.from('simulacoes_investimento').insert(payload)
    if (error) {
      toast.error('Erro ao salvar simulação')
    } else {
      toast.success('Simulação salva com sucesso!')
      setNomeSimulacao('')
      carregarSimulacoes()
    }
    setSalvando(false)
  }

  async function apagarSimulacao(id: string) {
    if (!confirm('Deseja excluir esta simulação?')) return
    const { error } = await supabase.from('simulacoes_investimento').delete().eq('id', id)
    if (!error) {
      toast.success('Simulação excluída')
      setSimulacoes(s => s.filter(x => x.id !== id))
    }
  }

  function carregarSimulacaoNaTela(sim: any) {
    if (modoComparar) return // no modo comparar, não carrega na tela
    setModo(sim.modo as ModoCalc)
    setValorInicial(Number(sim.valor_inicial))
    setAporteMensal(Number(sim.aporte_mensal))
    setTaxaMensal(Number(sim.taxa_mensal))
    setPrazoMeses(Number(sim.prazo_meses))
    setMetaValor(Number(sim.meta_valor))
    setIdadeAtual(Number(sim.idade_atual))
    setIdadeAposentadoria(Number(sim.idade_aposentadoria))
    setRendaDesejada(Number(sim.renda_desejada))
    toast.success(`Simulação "${sim.nome}" carregada`)
  }

  function toggleSelecionar(id: string) {
    setSimulacoesSelecionadas(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) {
        toast.error('Selecione no máximo 2 simulações para comparar')
        return prev
      }
      return [...prev, id]
    })
  }

  // Gera dados de grafico para uma simulacao salva
  function getDadosSimulacao(sim: any) {
    const prazo = sim.modo === 'aposentadoria'
      ? (Number(sim.idade_aposentadoria) - Number(sim.idade_atual)) * 12
      : Number(sim.prazo_meses)
    return calcularJurosCompostos(
      Number(sim.aporte_mensal),
      Number(sim.taxa_mensal),
      prazo,
      Number(sim.valor_inicial)
    )
  }

  // Cálculos derivados
  const prazoReal = useMemo(() => {
    if (modo === 'aposentadoria') return (idadeAposentadoria - idadeAtual) * 12
    return prazoMeses
  }, [modo, prazoMeses, idadeAtual, idadeAposentadoria])

  const dados = useMemo(() =>
    calcularJurosCompostos(aportesMensal, taxaMensal, prazoReal, valorInicial),
    [aportesMensal, taxaMensal, prazoReal, valorInicial]
  )

  const valorFinal     = dados[dados.length - 1]?.valor || 0
  const totalAportado  = valorInicial + aportesMensal * prazoReal
  const totalJuros     = valorFinal - totalAportado
  const rendaMensal    = valorFinal * (taxaMensal / 100) // renda passiva estimada

  // Tempo para meta
  const mesesParaMeta = useMemo(() => {
    if (!metaValor || modo !== 'meta') return null
    for (const d of calcularJurosCompostos(aportesMensal, taxaMensal, 600, valorInicial)) {
      if (d.valor >= metaValor) return d.mes
    }
    return null
  }, [metaValor, aportesMensal, taxaMensal, valorInicial, modo])

  // Formatar dados do gráfico (mostrar a cada N meses)
  const dadosGrafico = useMemo(() => {
    const step = Math.max(1, Math.floor(prazoReal / 24))
    return dados.filter((_, i) => i % step === 0 || i === dados.length - 1).map(d => ({
      ...d,
      mes: `${d.mes}m`,
      juros: d.valor - d.aportado,
    }))
  }, [dados, prazoReal])

  const BENCHMARKS = [
    { label: 'Poupança', taxa: 0.5 },
    { label: 'CDI (aprox.)', taxa: 0.88 },
    { label: 'IPCA+6%', taxa: 1.03 },
    { label: 'Bolsa (Ibovespa avg.)', taxa: 1.2 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">📈 Simulador de Investimentos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Planeje seus aportes e visualize o crescimento com juros compostos
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Nome da simulação..." 
            className="input text-sm h-10 w-48"
            value={nomeSimulacao}
            onChange={e => setNomeSimulacao(e.target.value)}
          />
          <button 
            onClick={salvarSimulacao} 
            disabled={salvando || !nomeSimulacao.trim()}
            className="btn-primary h-10 px-4"
          >
            {salvando ? 'Salvando...' : '💾 Salvar'}
          </button>
        </div>
      </div>

      {/* Simulações Salvas */}
      {simulacoes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-2 flex-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300">
              {simulacoes.map(sim => {
                const selecionada = simulacoesSelecionadas.includes(sim.id)
                return (
                  <div key={sim.id} className={`flex-shrink-0 flex items-center rounded-lg overflow-hidden shadow-sm border transition-all ${
                    modoComparar
                      ? selecionada
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    {modoComparar && (
                      <div className="pl-3">
                        <input
                          type="checkbox"
                          checked={selecionada}
                          onChange={() => toggleSelecionar(sim.id)}
                          className="w-4 h-4 accent-blue-600"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => modoComparar ? toggleSelecionar(sim.id) : carregarSimulacaoNaTela(sim)}
                      className="px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {sim.nome}
                    </button>
                    {!modoComparar && (
                      <>
                        <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700"></div>
                        <button
                          onClick={() => apagarSimulacao(sim.id)}
                          className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Excluir"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => { setModoComparar(m => !m); setSimulacoesSelecionadas([]) }}
              className={`flex-shrink-0 px-3 py-2 text-sm font-semibold rounded-lg border transition-all ${
                modoComparar
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300'
              }`}
            >
              ⚖️ Comparar
            </button>
          </div>

          {/* Painel de comparação */}
          {modoComparar && simulacoesSelecionadas.length === 2 && (() => {
            const simA = simulacoes.find(s => s.id === simulacoesSelecionadas[0])!
            const simB = simulacoes.find(s => s.id === simulacoesSelecionadas[1])!
            const dadosA = getDadosSimulacao(simA)
            const dadosB = getDadosSimulacao(simB)
            const maxMeses = Math.max(dadosA.length, dadosB.length)
            const step = Math.max(1, Math.floor(maxMeses / 24))

            // Combinar dados para o gráfico
            const graficoCombinado = Array.from({ length: maxMeses }, (_, i) => ({
              mes: `${i + 1}m`,
              [simA.nome]: dadosA[i]?.valor ?? null,
              [simB.nome]: dadosB[i]?.valor ?? null,
            })).filter((_, i) => i % step === 0 || i === maxMeses - 1)

            const valorFinalA = dadosA[dadosA.length - 1]?.valor || 0
            const valorFinalB = dadosB[dadosB.length - 1]?.valor || 0

            return (
              <div className="card space-y-4 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">⚖️ Comparação: {simA.nome} vs {simB.nome}</h3>

                {/* Tabela de parâmetros */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-gray-500">Parâmetro</th>
                        <th className="text-right py-2 px-3 text-blue-600">{simA.nome}</th>
                        <th className="text-right py-2 px-3 text-purple-600">{simB.nome}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {[
                        { label: 'Valor Inicial', a: formatBRL(simA.valor_inicial), b: formatBRL(simB.valor_inicial) },
                        { label: 'Aporte Mensal', a: formatBRL(simA.aporte_mensal), b: formatBRL(simB.aporte_mensal) },
                        { label: 'Taxa Mensal', a: `${simA.taxa_mensal}%`, b: `${simB.taxa_mensal}%` },
                        { label: 'Prazo', a: `${dadosA.length}m`, b: `${dadosB.length}m` },
                        { label: '💰 Valor Final', a: formatBRL(valorFinalA), b: formatBRL(valorFinalB), destaque: true },
                      ].map(row => (
                        <tr key={row.label} className={row.destaque ? 'font-bold bg-gray-50 dark:bg-gray-800' : ''}>
                          <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{row.label}</td>
                          <td className="py-2 px-3 text-right text-blue-700 dark:text-blue-300">{row.a}</td>
                          <td className="py-2 px-3 text-right text-purple-700 dark:text-purple-300">{row.b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Gráfico dual */}
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={graficoCombinado}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any, name: string) => [formatBRL(Number(v)), name]} />
                    <Legend />
                    <Line type="monotone" dataKey={simA.nome} stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey={simB.nome} stroke="#a855f7" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )
          })()}

          {modoComparar && simulacoesSelecionadas.length < 2 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Selecione 2 simulações para comparar ({simulacoesSelecionadas.length}/2 selecionadas)
            </p>
          )}
        </div>
      )}

      {/* Modo */}
      <div className="flex flex-wrap gap-2">
        {([
          { id: 'livre', label: '🎯 Simulação Livre', desc: 'Defina prazo e aporte' },
          { id: 'meta', label: '🏆 Meta de Valor', desc: 'Quando chegarei?' },
          { id: 'aposentadoria', label: '🏖️ Aposentadoria', desc: 'Planejamento de longo prazo' },
        ] as { id: ModoCalc; label: string; desc: string }[]).map(m => (
          <button
            key={m.id}
            onClick={() => setModo(m.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              modo === m.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parâmetros */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">⚙️ Parâmetros</h2>
            <div className="space-y-4">

              <div>
                <label className="label">Valor Inicial (R$)</label>
                <input type="number" className="input" value={valorInicial} min={0}
                  onChange={e => setValorInicial(Number(e.target.value))} />
              </div>

              <div>
                <label className="label">Aporte Mensal (R$)</label>
                <input type="number" className="input" value={aportesMensal} min={0}
                  onChange={e => setAporteMensal(Number(e.target.value))} />
              </div>

              <div>
                <label className="label flex justify-between">
                  <span>Taxa Mensal (%)</span>
                  <span className="text-blue-500 font-bold">{taxaMensal}%</span>
                </label>
                <input type="range" min={0.1} max={5} step={0.05} value={taxaMensal}
                  onChange={e => setTaxaMensal(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer" />
                <div className="flex flex-wrap gap-1 mt-2">
                  {BENCHMARKS.map(b => (
                    <button key={b.label} onClick={() => setTaxaMensal(b.taxa)}
                      className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors">
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {modo === 'livre' && (
                <div>
                  <label className="label flex justify-between">
                    <span>Prazo</span>
                    <span className="text-blue-500 font-bold">
                      {prazoMeses >= 12
                        ? `${Math.floor(prazoMeses / 12)}a ${prazoMeses % 12}m`
                        : `${prazoMeses} meses`}
                    </span>
                  </label>
                  <input type="range" min={6} max={360} step={6} value={prazoMeses}
                    onChange={e => setPrazoMeses(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer" />
                </div>
              )}

              {modo === 'meta' && (
                <div>
                  <label className="label">Meta (R$)</label>
                  <input type="number" className="input" value={metaValor} min={0}
                    onChange={e => setMetaValor(Number(e.target.value))} />
                  {mesesParaMeta && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1.5 font-medium">
                      ✅ Meta em {Math.floor(mesesParaMeta / 12)} anos e {mesesParaMeta % 12} meses
                    </p>
                  )}
                  {metaValor > 0 && !mesesParaMeta && (
                    <p className="text-xs text-orange-600 mt-1.5">⚠️ Meta não atingida em 50 anos</p>
                  )}
                </div>
              )}

              {modo === 'aposentadoria' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Idade Atual</label>
                      <input type="number" className="input" value={idadeAtual} min={18} max={70}
                        onChange={e => setIdadeAtual(Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="label">Aposentadoria</label>
                      <input type="number" className="input" value={idadeAposentadoria} min={30} max={80}
                        onChange={e => setIdadeAposentadoria(Number(e.target.value))} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Renda Desejada/mês (R$)</label>
                    <input type="number" className="input" value={rendaDesejada} min={0}
                      onChange={e => setRendaDesejada(Number(e.target.value))} />
                    <p className="text-xs text-gray-500 mt-1">
                      Capital necessário: {formatBRL(rendaDesejada / (taxaMensal / 100))}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Resultados e gráfico */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cards de resultado */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Valor Final', valor: formatBRL(valorFinal), cor: 'blue', icon: '💰' },
              { label: 'Total Aportado', valor: formatBRL(totalAportado), cor: 'gray', icon: '📥' },
              { label: 'Juros Ganhos', valor: formatBRL(totalJuros), cor: 'green', icon: '📈' },
              { label: 'Renda Passiva/mês', valor: formatBRL(rendaMensal), cor: 'purple', icon: '🏖️' },
            ].map(item => (
              <div key={item.label} className="card text-center">
                <div className="text-xl mb-1">{item.icon}</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">{item.label}</p>
                <p className={`text-base font-bold ${
                  item.cor === 'blue' ? 'text-blue-600' :
                  item.cor === 'green' ? 'text-green-600' :
                  item.cor === 'purple' ? 'text-purple-600' :
                  'text-gray-700 dark:text-gray-300'
                }`}>{item.valor}</p>
              </div>
            ))}
          </div>

          {/* Gráfico */}
          <div className="card">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">📊 Evolução do Patrimônio</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: any, name: string) => [
                    formatBRL(Number(v)),
                    name === 'valor' ? 'Patrimônio' : name === 'aportado' ? 'Total Aportado' : 'Juros',
                  ]}
                />
                {modo === 'meta' && metaValor > 0 && (
                  <ReferenceLine y={metaValor} stroke="#f59e0b" strokeDasharray="5 5"
                    label={{ value: 'Meta', fill: '#f59e0b', fontSize: 11 }} />
                )}
                {modo === 'aposentadoria' && rendaDesejada > 0 && (
                  <ReferenceLine y={rendaDesejada / (taxaMensal / 100)} stroke="#8b5cf6"
                    strokeDasharray="5 5"
                    label={{ value: 'Capital Necessário', fill: '#8b5cf6', fontSize: 11 }} />
                )}
                <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2.5}
                  dot={false} name="valor" />
                <Line type="monotone" dataKey="aportado" stroke="#9ca3af" strokeWidth={1.5}
                  dot={false} strokeDasharray="4 4" name="aportado" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Mult do patrimônio */}
          <div className="card">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3">✨ Poder dos Juros Compostos</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Aportado</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{formatBRL(totalAportado)}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-3 bg-gray-400 rounded-full" style={{ width: `${Math.min(100, (totalAportado / valorFinal) * 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-600">Juros</span>
                  <span className="font-medium text-green-600">{formatBRL(totalJuros)}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-1">
                  <div className="h-3 bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalJuros / valorFinal) * 100)}%` }} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {totalAportado > 0 ? (valorFinal / totalAportado).toFixed(1) : '—'}x
                </p>
                <p className="text-xs text-gray-500">multiplicador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
