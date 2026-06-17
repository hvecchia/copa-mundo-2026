import { useState, useEffect } from 'react'
import Flag from './Flag'

const API_URL = 'http://localhost:8000/api/jogos?status=encerrado'
const LIMIT = 6

function formatData(dataHora) {
  const datePart = dataHora.replace(' ', 'T').split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  const weekday = new Date(year, month - 1, day)
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')
  const label = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${label}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
}

function formatFase(jogo) {
  if (jogo.fase === 'grupo') return `Grupo ${jogo.grupo} · Rodada ${jogo.rodada}`
  return {
    rodada_32: 'Rodada de 32',
    oitavas:   'Oitavas de Final',
    quartas:   'Quartas de Final',
    semi:      'Semifinal',
    terceiro:  '3º Lugar',
    final:     'Final',
  }[jogo.fase] ?? jogo.fase
}

// Retorna 'a', 'b' ou 'empate'
function resultado(gols_a, gols_b) {
  if (gols_a > gols_b) return 'a'
  if (gols_b > gols_a) return 'b'
  return 'empate'
}

function CardSkeleton() {
  return (
    <div className="bg-copa-card border border-copa-border rounded-xl p-4 animate-pulse flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="h-3 bg-gray-800 rounded w-1/3" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="h-8 w-8 bg-gray-800 rounded-full" />
          <div className="h-3 bg-gray-800 rounded w-3/4" />
        </div>
        <div className="h-8 w-14 bg-gray-800 rounded mx-2" />
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="h-8 w-8 bg-gray-800 rounded-full" />
          <div className="h-3 bg-gray-800 rounded w-3/4" />
        </div>
      </div>
      <div className="h-3 bg-gray-800 rounded w-2/5 mx-auto" />
    </div>
  )
}

function ResultadoCard({ jogo }) {
  const res = resultado(jogo.gols_a, jogo.gols_b)
  const empate = res === 'empate'

  // Estilo do nome: vencedor = branco, perdedor = esmaecido, empate = cinza médio
  const estiloA = res === 'a' ? 'text-copa-green font-bold' : empate ? 'text-gray-400' : 'text-gray-600'
  const estiloB = res === 'b' ? 'text-copa-green font-bold' : empate ? 'text-gray-400' : 'text-gray-600'

  return (
    <div className="bg-copa-card border border-copa-border rounded-xl p-4 flex flex-col gap-3 hover:border-gray-600 transition-colors">
      {/* Fase + data */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-copa-green text-xs font-medium truncate">
          {formatFase(jogo)}
        </span>
        <span className="text-gray-600 text-xs shrink-0">
          {formatData(jogo.data_hora)}
        </span>
      </div>

      {/* Confronto */}
      <div className="flex items-center gap-2">
        {/* Seleção A */}
        <div className="flex flex-col items-center gap-1 flex-1 text-center min-w-0">
          <Flag emoji={jogo.selecao_a_bandeira} size="text-3xl" />
          <span className={`text-xs font-semibold leading-tight line-clamp-2 ${estiloA}`}>
            {jogo.selecao_a_nome}
          </span>
        </div>

        {/* Placar */}
        <div className="flex flex-col items-center shrink-0 px-2 min-w-[52px]">
          <span className="text-copa-yellow text-2xl font-black tabular-nums leading-none">
            {jogo.gols_a} – {jogo.gols_b}
          </span>
          {empate && (
            <span className="text-gray-600 text-[10px] uppercase tracking-widest mt-1">
              Empate
            </span>
          )}
        </div>

        {/* Seleção B */}
        <div className="flex flex-col items-center gap-1 flex-1 text-center min-w-0">
          <Flag emoji={jogo.selecao_b_bandeira} size="text-3xl" />
          <span className={`text-xs font-semibold leading-tight line-clamp-2 ${estiloB}`}>
            {jogo.selecao_b_nome}
          </span>
        </div>
      </div>

      {/* Estádio */}
      <p className="text-gray-700 text-xs text-center truncate">
        {jogo.estadio} · {jogo.cidade}
      </p>
    </div>
  )
}

export default function UltimosResultados() {
  const [jogos, setJogos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Erro ${res.status}`)
        return res.json()
      })
      .then((data) => {
        // Ordena por data_hora DESC (mais recente primeiro) e pega os 6 últimos
        const ultimos = data
          .sort((a, b) => b.data_hora.localeCompare(a.data_hora))
          .slice(0, LIMIT)
        setJogos(ultimos)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="px-6 py-12 max-w-6xl mx-auto w-full">
      <h2 className="text-white text-2xl font-bold mb-6">Últimos Resultados</h2>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: LIMIT }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {error && (
        <div className="text-center py-10">
          <p className="text-gray-400">Não foi possível carregar os resultados.</p>
          <p className="text-gray-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && jogos.length === 0 && (
        <p className="text-gray-500 text-center py-10">Nenhum resultado disponível ainda.</p>
      )}

      {!loading && !error && jogos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jogos.map((jogo) => (
            <ResultadoCard key={jogo.id} jogo={jogo} />
          ))}
        </div>
      )}
    </section>
  )
}
