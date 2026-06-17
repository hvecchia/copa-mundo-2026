import { useState, useEffect } from 'react'
import JogoCard from '../components/jogos/JogoCard'
import FiltrosJogos from '../components/jogos/FiltrosJogos'
const API_BASE = 'http://localhost:8000/api/jogos'

// Agrupa lista de jogos por data (YYYY-MM-DD), mantendo ordem cronológica
function agruparPorData(jogos) {
  const mapa = {}
  jogos.forEach(jogo => {
    const data = jogo.data_hora.replace(' ', 'T').split('T')[0]
    if (!mapa[data]) mapa[data] = []
    mapa[data].push(jogo)
  })
  return Object.entries(mapa)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([data, items]) => [
      data,
      items.sort((a, b) => a.data_hora.localeCompare(b.data_hora)),
    ])
}

function formatDiaGrupo(dataStr) {
  const [year, month, day] = dataStr.split('-').map(Number)
  // new Date(y, m-1, d) cria data local — evita desvio de fuso
  const d = new Date(year, month - 1, day)
  const label = d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function CardSkeleton() {
  return (
    <div className="bg-copa-card border border-copa-border rounded-xl p-4 animate-pulse flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="h-3 bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-1/5" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center justify-end gap-2">
          <div className="h-3 bg-gray-800 rounded w-24" />
          <div className="h-8 w-8 bg-gray-800 rounded-full" />
        </div>
        <div className="w-20 h-6 bg-gray-800 rounded mx-auto" />
        <div className="flex-1 flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-800 rounded-full" />
          <div className="h-3 bg-gray-800 rounded w-24" />
        </div>
      </div>
      <div className="h-3 bg-gray-800 rounded w-2/5 mx-auto" />
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  )
}

export default function TabelaPage() {
  useEffect(() => { document.title = 'Tabela de Jogos — Copa 2026' }, [])
  const [jogos, setJogos]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [filtros, setFiltros] = useState({ status: '', fase: '', grupo: '' })

  useEffect(() => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    if (filtros.status) params.set('status', filtros.status)
    if (filtros.fase)   params.set('fase',   filtros.fase)
    if (filtros.grupo)  params.set('grupo',  filtros.grupo)

    const url = params.toString() ? `${API_BASE}?${params}` : API_BASE

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Erro ${res.status}`)
        return res.json()
      })
      .then(data => setJogos(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [filtros])

  const grupos = agruparPorData(jogos)
  const totalJogos = jogos.length

  return (
    <div className="min-h-screen px-6 py-12 max-w-4xl mx-auto">

      {/* Cabeçalho da página */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-1">Tabela de Jogos</h1>
        <p className="text-gray-500 text-sm">Copa do Mundo FIFA 2026</p>
      </div>

      {/* Filtros */}
      <FiltrosJogos filtros={filtros} onChange={setFiltros} />

      {/* Contador de resultados */}
      {!loading && !error && totalJogos > 0 && (
        <p className="text-gray-600 text-xs mb-6">
          {totalJogos} {totalJogos === 1 ? 'jogo encontrado' : 'jogos encontrados'}
        </p>
      )}

      {/* Loading */}
      {loading && <SkeletonList />}

      {/* Erro */}
      {error && (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-1">Não foi possível carregar os jogos.</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      )}

      {/* Vazio */}
      {!loading && !error && grupos.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <span className="text-4xl">🔍</span>
          <p className="text-gray-400">Nenhum jogo encontrado com esses filtros.</p>
          <button
            onClick={() => setFiltros({ status: '', fase: '', grupo: '' })}
            className="text-copa-green text-sm hover:underline underline-offset-2"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* Lista agrupada por data */}
      {!loading && !error && grupos.map(([data, jogosNoDia]) => (
        <div key={data} className="mb-10">
          <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-4 pb-2 border-b border-copa-border">
            {formatDiaGrupo(data)}
          </h2>
          <div className="flex flex-col gap-3">
            {jogosNoDia.map(jogo => (
              <JogoCard key={jogo.id} jogo={jogo} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
