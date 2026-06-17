import { useState, useEffect } from 'react'
import TabelaGrupo from '../components/grupos/TabelaGrupo'

const API_CLASSIF = 'http://localhost:8000/api/classificacao'
const API_JOGOS   = 'http://localhost:8000/api/jogos?fase=grupo'

function SkeletonCard() {
  return (
    <div className="bg-copa-card border border-copa-border rounded-xl overflow-hidden animate-pulse">
      <div className="px-4 py-3 border-b border-copa-border">
        <div className="h-4 bg-gray-800 rounded w-20" />
      </div>
      <div className="p-3 flex flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3 bg-gray-800 rounded w-4" />
            <div className="h-4 w-4 bg-gray-800 rounded-full" />
            <div className="h-3 bg-gray-800 rounded flex-1" />
            <div className="h-3 bg-gray-800 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GruposPage() {
  useEffect(() => { document.title = 'Grupos — Copa 2026' }, [])
  const [classificacao, setClassificacao] = useState([])
  const [jogos,         setJogos]         = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  useEffect(() => {
    Promise.all([
      fetch(API_CLASSIF).then(r => { if (!r.ok) throw new Error(`Erro ${r.status}`); return r.json() }),
      fetch(API_JOGOS)  .then(r => { if (!r.ok) throw new Error(`Erro ${r.status}`); return r.json() }),
    ])
      .then(([classif, jogosData]) => {
        setClassificacao(classif)
        setJogos(jogosData)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen px-6 py-12 max-w-6xl mx-auto">

      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-white text-3xl font-bold mb-1">Grupos</h1>
        <p className="text-gray-500 text-sm">Classificação e jogos da fase de grupos — Copa do Mundo FIFA 2026</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-1">Não foi possível carregar os grupos.</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      )}

      {/* Grid de grupos */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classificacao.map(({ grupo, classificacao: classif }) => {
            const jogosDoGrupo = jogos
              .filter(j => j.grupo === grupo)
              .sort((a, b) => a.data_hora.localeCompare(b.data_hora))

            return (
              <TabelaGrupo
                key={grupo}
                grupo={grupo}
                classificacao={classif}
                jogos={jogosDoGrupo}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
