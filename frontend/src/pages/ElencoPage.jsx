import { useState, useEffect } from 'react'
import Flag from '../components/Flag'

const API = 'http://localhost:8000/api'

// ── Constantes de posição ────────────────────────────────────────────────────

const POS = {
  GK:  { label: 'GK',  cor: 'bg-yellow-900/50 text-yellow-400 border-yellow-800/50' },
  DEF: { label: 'DEF', cor: 'bg-blue-900/50   text-blue-400   border-blue-800/50'   },
  MID: { label: 'MID', cor: 'bg-green-900/50  text-green-400  border-green-800/50'  },
  FWD: { label: 'FWD', cor: 'bg-red-900/50    text-red-400    border-red-800/50'    },
}

const POS_FILTROS = [
  { value: '',    label: 'Todos'      },
  { value: 'GK',  label: 'Goleiros'   },
  { value: 'DEF', label: 'Defensores' },
  { value: 'MID', label: 'Meias'      },
  { value: 'FWD', label: 'Atacantes'  },
]

function PosBadge({ pos }) {
  const cfg = POS[pos] ?? { label: pos, cor: 'bg-gray-800 text-gray-400 border-gray-700' }
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cfg.cor}`}>
      {cfg.label}
    </span>
  )
}

// ── Componente: card de seleção no grid ──────────────────────────────────────

function SelecaoBtn({ selecao, onClick }) {
  return (
    <button
      onClick={() => onClick(selecao)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-copa-card border border-copa-border
                 hover:border-copa-green hover:bg-green-900/10 transition-colors text-left w-full"
    >
      <Flag emoji={selecao.bandeira_emoji} size="text-xl" className="shrink-0" />
      <span className="text-gray-300 text-sm truncate">{selecao.nome_pt}</span>
      {selecao.eh_cabeca_chave ? (
        <span className="ml-auto text-[9px] text-copa-gold border border-copa-gold/40 px-1 py-px rounded shrink-0">
          CH
        </span>
      ) : null}
    </button>
  )
}

// ── Componente: grid de seleções agrupado por grupo ──────────────────────────

function GridSelecoes({ selecoes, onSelect }) {
  const grupos = {}
  selecoes.forEach(s => {
    if (!grupos[s.grupo]) grupos[s.grupo] = []
    grupos[s.grupo].push(s)
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Object.entries(grupos)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([grupo, times]) => (
          <div key={grupo} className="flex flex-col gap-1.5">
            <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest px-1">
              Grupo {grupo}
            </p>
            {times.map(s => (
              <SelecaoBtn key={s.id} selecao={s} onClick={onSelect} />
            ))}
          </div>
        ))}
    </div>
  )
}

// ── Componente: tabela de jogadores ─────────────────────────────────────────

function TabelaJogadores({ jogadores, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 bg-copa-card border border-copa-border rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (jogadores.length === 0) {
    return <p className="text-gray-500 text-sm text-center py-10">Nenhum jogador encontrado.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-copa-border text-gray-600 text-xs">
            <th className="text-left py-2 px-3 w-8">#</th>
            <th className="text-left py-2 px-2">Nome</th>
            <th className="text-left py-2 px-2 w-16">Pos.</th>
            <th className="text-left py-2 px-2 hidden sm:table-cell">Clube</th>
          </tr>
        </thead>
        <tbody>
          {jogadores.map(j => (
            <tr
              key={j.id}
              className="border-b border-copa-border/30 last:border-0 hover:bg-white/5 transition-colors"
            >
              <td className="py-2.5 px-3 text-gray-500 tabular-nums text-xs">{j.numero ?? '—'}</td>
              <td className="py-2.5 px-2">
                <span className="text-gray-200">{j.nome}</span>
                {j.eh_capitao ? (
                  <span
                    className="ml-1.5 text-copa-yellow text-[10px] font-bold"
                    title="Capitão"
                  >
                    (C)
                  </span>
                ) : null}
              </td>
              <td className="py-2.5 px-2">
                <PosBadge pos={j.posicao} />
              </td>
              <td className="py-2.5 px-2 text-gray-500 text-xs hidden sm:table-cell truncate max-w-[140px]">
                {j.clube ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Componente: perfil da seleção selecionada ────────────────────────────────

const CONF_LABEL = {
  CONMEBOL: 'CONMEBOL', UEFA: 'UEFA', CAF: 'CAF',
  CONCACAF: 'CONCACAF', AFC: 'AFC',  OFC: 'OFC',
}

function PerfilSelecao({ selecao }) {
  return (
    <div className="flex items-center gap-4 bg-copa-card border border-copa-border rounded-xl px-5 py-4">
      <Flag emoji={selecao.bandeira_emoji} size="text-5xl" className="shrink-0" />
      <div className="min-w-0">
        <h2 className="text-white text-xl font-bold leading-tight">{selecao.nome_pt}</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          Grupo {selecao.grupo} · {CONF_LABEL[selecao.confederacao] ?? selecao.confederacao}
          {selecao.pote ? ` · Pote ${selecao.pote}` : ''}
        </p>
        {selecao.treinador && (
          <p className="text-gray-600 text-xs mt-1">Treinador: {selecao.treinador}</p>
        )}
      </div>
      {selecao.eh_cabeca_chave ? (
        <span className="ml-auto shrink-0 text-[10px] text-copa-gold border border-copa-gold/40 px-1.5 py-0.5 rounded">
          Cabeça de Chave
        </span>
      ) : null}
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function ElencoPage() {
  useEffect(() => { document.title = 'Elencos — Copa 2026' }, [])
  const [selecoes,   setSelecoes]   = useState([])
  const [selected,   setSelected]   = useState(null)
  const [jogadores,  setJogadores]  = useState([])
  const [busca,      setBusca]      = useState('')
  const [posFiltro,  setPosFiltro]  = useState('')
  const [loadingSel, setLoadingSel] = useState(true)
  const [loadingJog, setLoadingJog] = useState(false)
  const [errorSel,   setErrorSel]   = useState(null)

  // Busca todas as seleções ao montar
  useEffect(() => {
    fetch(`${API}/selecoes`)
      .then(r => { if (!r.ok) throw new Error(`Erro ${r.status}`); return r.json() })
      .then(setSelecoes)
      .catch(err => setErrorSel(err.message))
      .finally(() => setLoadingSel(false))
  }, [])

  // Busca jogadores quando seleção ou filtro de posição muda
  useEffect(() => {
    if (!selected) return
    setLoadingJog(true)
    setJogadores([])
    const qs = posFiltro ? `?posicao=${posFiltro}` : ''
    fetch(`${API}/selecoes/${selected.id}/jogadores${qs}`)
      .then(r => { if (!r.ok) throw new Error(`Erro ${r.status}`); return r.json() })
      .then(setJogadores)
      .catch(() => setJogadores([]))
      .finally(() => setLoadingJog(false))
  }, [selected, posFiltro])

  function handleVoltar() {
    setSelected(null)
    setJogadores([])
    setPosFiltro('')
  }

  // Filtra seleções pelo campo de busca (sem alterar estado da seleção ativa)
  const selecoesFiltradas = busca.trim()
    ? selecoes.filter(s => s.nome_pt.toLowerCase().includes(busca.toLowerCase()))
    : selecoes

  return (
    <div className="min-h-screen px-6 py-12 max-w-6xl mx-auto">

      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-white text-3xl font-bold mb-1">Elencos</h1>
        <p className="text-gray-500 text-sm">Elencos das 48 seleções — Copa do Mundo FIFA 2026</p>
      </div>

      {/* Campo de busca */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm select-none">
          🔍
        </span>
        <input
          type="text"
          value={busca}
          onChange={e => { setBusca(e.target.value); if (selected) handleVoltar() }}
          placeholder="Buscar seleção…"
          className="w-full max-w-sm bg-copa-card border border-copa-border rounded-lg
                     pl-9 pr-4 py-2 text-gray-300 text-sm placeholder-gray-600
                     focus:outline-none focus:border-copa-green transition-colors"
        />
      </div>

      {/* ── Estado: CARREGANDO seleções ─────────────────────────────── */}
      {loadingSel && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 bg-gray-800 rounded w-16 animate-pulse" />
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="h-10 bg-copa-card border border-copa-border rounded-lg animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Estado: ERRO ao carregar seleções ───────────────────────── */}
      {errorSel && (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-1">Não foi possível carregar as seleções.</p>
          <p className="text-gray-600 text-sm">{errorSel}</p>
        </div>
      )}

      {/* ── Estado: GRID de seleções (nenhuma selecionada) ──────────── */}
      {!loadingSel && !errorSel && !selected && (
        <>
          {selecoesFiltradas.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10">
              Nenhuma seleção encontrada para "{busca}".
            </p>
          ) : (
            <GridSelecoes selecoes={selecoesFiltradas} onSelect={s => { setSelected(s); setBusca('') }} />
          )}
        </>
      )}

      {/* ── Estado: ELENCO da seleção selecionada ───────────────────── */}
      {!loadingSel && !errorSel && selected && (
        <div>
          {/* Botão voltar */}
          <button
            onClick={handleVoltar}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-5 transition-colors"
          >
            ← Voltar para todas as seleções
          </button>

          {/* Perfil da seleção */}
          <PerfilSelecao selecao={selected} />

          {/* Filtro por posição */}
          <div className="flex flex-wrap gap-1.5 mt-5 mb-4">
            {POS_FILTROS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setPosFiltro(value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                  ${posFiltro === value
                    ? 'bg-copa-green border-copa-green text-white'
                    : 'bg-copa-card border-copa-border text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tabela de jogadores */}
          <div className="bg-copa-card border border-copa-border rounded-xl overflow-hidden">
            <TabelaJogadores jogadores={jogadores} loading={loadingJog} />
          </div>

          {/* Contagem */}
          {!loadingJog && jogadores.length > 0 && (
            <p className="text-gray-700 text-xs text-right mt-2">
              {jogadores.length} jogador{jogadores.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
