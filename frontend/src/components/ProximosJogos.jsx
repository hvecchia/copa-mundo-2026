import { useState, useEffect } from 'react'
import Flag from './Flag'

const API_URL = 'http://localhost:8000/api/jogos?status=agendado&limit=6'

function formatDataHora(dataHora) {
  // Aceita "2026-06-13T19:00:00" e "2026-06-13 19:00:00"
  const [datePart, timePart] = dataHora.replace(' ', 'T').split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':')

  // new Date(year, month-1, day) cria data local — evita desvio de UTC
  const weekday = new Date(year, month - 1, day)
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')

  const label = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const minStr = minute !== '00' ? minute : ''
  return `${label}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')} às ${hour}h${minStr}`
}

function CardSkeleton() {
  return (
    <div className="bg-copa-card border border-copa-border rounded-xl p-4 animate-pulse flex flex-col gap-3">
      <div className="h-3 bg-gray-800 rounded w-2/5" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="h-8 w-8 bg-gray-800 rounded-full" />
          <div className="h-3 bg-gray-800 rounded w-3/4" />
        </div>
        <div className="h-4 w-6 bg-gray-800 rounded" />
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="h-8 w-8 bg-gray-800 rounded-full" />
          <div className="h-3 bg-gray-800 rounded w-3/4" />
        </div>
      </div>
      <div className="h-3 bg-gray-800 rounded w-3/5 mx-auto" />
    </div>
  )
}

function JogoCard({ jogo }) {
  return (
    <div className="bg-copa-card border border-copa-border rounded-xl p-4 flex flex-col gap-3 hover:border-gray-600 transition-colors">
      <span className="text-gray-500 text-xs uppercase tracking-wider">
        {formatDataHora(jogo.data_hora)}
      </span>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-1 flex-1 text-center min-w-0">
          <Flag emoji={jogo.selecao_a_bandeira} size="text-3xl" />
          <span className="text-white text-xs font-semibold leading-tight line-clamp-2">
            {jogo.selecao_a_nome}
          </span>
        </div>

        <span className="text-gray-700 text-xs font-bold shrink-0 px-1">VS</span>

        <div className="flex flex-col items-center gap-1 flex-1 text-center min-w-0">
          <Flag emoji={jogo.selecao_b_bandeira} size="text-3xl" />
          <span className="text-white text-xs font-semibold leading-tight line-clamp-2">
            {jogo.selecao_b_nome}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-xs text-center truncate">
        {jogo.estadio} · {jogo.cidade}
      </p>
    </div>
  )
}

export default function ProximosJogos() {
  const [jogos, setJogos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`)
        return res.json()
      })
      .then((data) => setJogos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="px-6 py-12 max-w-6xl mx-auto w-full">
      <h2 className="text-white text-2xl font-bold mb-6">Próximos Jogos</h2>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-gray-400">Não foi possível carregar os jogos.</p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && jogos.length === 0 && (
        <p className="text-gray-500 text-center py-10">Nenhum jogo agendado no momento.</p>
      )}

      {!loading && !error && jogos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jogos.map((jogo) => (
            <JogoCard key={jogo.id} jogo={jogo} />
          ))}
        </div>
      )}
    </section>
  )
}
