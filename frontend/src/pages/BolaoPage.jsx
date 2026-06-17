import { useState, useEffect, useRef, useMemo } from 'react'
import Chaveamento from '../components/bolao/Chaveamento'
import Flag from '../components/Flag'

const API = 'http://localhost:8000/api'

function getSessionId() {
  const KEY = 'copa2026_sid'
  let id = sessionStorage.getItem(KEY)
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(KEY, id) }
  return id
}

// ── Cálculo local de classificação (espelha regras FIFA do backend) ───────────
// Permite feedback instantâneo sem esperar o debounce de save
// A API retorna campos planos: selecao_a_id, selecao_a_nome, selecao_a_bandeira
function calcularStandings(jogos, palpites) {
  if (!Array.isArray(jogos) || jogos.length === 0) return {}
  const grupos = {}

  jogos.forEach(j => {
    const g = j.grupo
    if (!g) return

    if (!grupos[g]) grupos[g] = {}

    const init = (id, nome_pt, bandeira_emoji) => {
      if (!id) return
      if (!grupos[g][id]) grupos[g][id] = {
        id, nome_pt, bandeira_emoji,
        J: 0, V: 0, E: 0, D: 0, GP: 0, GC: 0, SG: 0, Pts: 0,
      }
    }
    init(j.selecao_a_id, j.selecao_a_nome, j.selecao_a_bandeira)
    init(j.selecao_b_id, j.selecao_b_nome, j.selecao_b_bandeira)

    const p = palpites[j.id]
    if (!p || p.gols_a == null || p.gols_b == null) return

    const ga = Number(p.gols_a), gb = Number(p.gols_b)
    if (isNaN(ga) || isNaN(gb)) return

    const sa = grupos[g][j.selecao_a_id]
    const sb = grupos[g][j.selecao_b_id]
    if (!sa || !sb) return

    sa.J++; sb.J++
    sa.GP += ga; sa.GC += gb
    sb.GP += gb; sb.GC += ga

    if (ga > gb)      { sa.V++; sa.Pts += 3; sb.D++ }
    else if (ga < gb) { sb.V++; sb.Pts += 3; sa.D++ }
    else              { sa.E++; sa.Pts++;     sb.E++; sb.Pts++ }
  })

  const result = {}
  Object.entries(grupos).forEach(([letra, map]) => {
    const sorted = Object.values(map).sort(
      (a, b) => b.Pts - a.Pts || (b.GP - b.GC) - (a.GP - a.GC) || b.GP - a.GP
    )
    sorted.forEach((s, i) => { s.SG = s.GP - s.GC; s.posicao = i + 1 })
    result[letra] = sorted
  })
  return result
}

// ── Input de placar (stepper + campo numérico) ────────────────────────────────
function ScoreInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, (value ?? 0) - 1))}
        className="w-5 h-5 flex items-center justify-center rounded bg-white/10
                   text-white text-sm font-bold hover:bg-white/20 transition-colors select-none"
      >−</button>
      <input
        type="text"
        inputMode="numeric"
        value={value ?? ''}
        onChange={e => {
          const v = parseInt(e.target.value.replace(/\D/, ''))
          onChange(isNaN(v) ? null : Math.min(20, Math.max(0, v)))
        }}
        className="w-7 text-center bg-transparent text-white font-mono text-sm font-black
                   border-b border-copa-border focus:border-copa-green outline-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(20, (value ?? -1) + 1))}
        className="w-5 h-5 flex items-center justify-center rounded bg-white/10
                   text-white text-sm font-bold hover:bg-white/20 transition-colors select-none"
      >+</button>
    </div>
  )
}

// ── Linha de jogo com inputs de palpite ──────────────────────────────────────
function GameRow({ jogo, palpite, onPalpite, saveStatus }) {
  const ga = palpite?.gols_a
  const gb = palpite?.gols_b
  const preenchido = ga != null && gb != null

  function changeA(v) { onPalpite(jogo.id, { gols_a: v, gols_b: gb ?? 0 }) }
  function changeB(v) { onPalpite(jogo.id, { gols_a: ga ?? 0, gols_b: v }) }

  return (
    <div className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg border transition-colors
      ${preenchido ? 'border-white/10 bg-white/[0.03]' : 'border-transparent'}`}>

      <span className="text-gray-600 text-[10px] w-8 shrink-0 font-medium">R{jogo.rodada}</span>

      {/* Time A */}
      <div className="flex items-center gap-1 flex-1 justify-end min-w-0">
        <span className="text-gray-300 text-xs truncate">{jogo.selecao_a_nome}</span>
        <Flag emoji={jogo.selecao_a_bandeira} size="text-base" className="shrink-0" />
      </div>

      {/* Placar */}
      <div className="flex items-center gap-1.5 shrink-0">
        <ScoreInput value={ga} onChange={changeA} />
        <span className="text-gray-600 text-xs font-bold">×</span>
        <ScoreInput value={gb} onChange={changeB} />
      </div>

      {/* Time B */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <Flag emoji={jogo.selecao_b_bandeira} size="text-base" className="shrink-0" />
        <span className="text-gray-300 text-xs truncate">{jogo.selecao_b_nome}</span>
      </div>

      {/* Ícone de save */}
      <div className="w-4 shrink-0 text-right">
        {saveStatus === 'saving' && (
          <span className="text-gray-600 text-[10px] animate-pulse">●</span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-copa-green text-[10px]">✓</span>
        )}
      </div>
    </div>
  )
}

// ── Tabela de classificação mini ──────────────────────────────────────────────
function MiniTabela({ standings }) {
  if (!standings?.length) return (
    <p className="text-gray-700 text-xs text-center py-4">Nenhum palpite ainda.</p>
  )

  const corBarra = pos => {
    if (pos <= 2) return 'bg-copa-green'
    if (pos === 3) return 'bg-copa-yellow'
    return 'bg-transparent'
  }

  return (
    <>
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-gray-600 text-left py-1 w-4" />
            <th className="text-gray-600 text-left py-1">Seleção</th>
            <th className="text-gray-600 text-right py-1 w-5">J</th>
            <th className="text-gray-600 text-right py-1 w-8">Pts</th>
            <th className="text-gray-600 text-right py-1 w-8">SG</th>
            <th className="text-gray-600 text-right py-1 w-8">GP</th>
          </tr>
        </thead>
        <tbody>
          {standings.map(s => (
            <tr key={s.id} className="border-t border-white/5">
              <td className="py-1.5">
                <div className={`w-[3px] h-4 rounded-full ${corBarra(s.posicao)}`} />
              </td>
              <td className="py-1.5">
                <div className="flex items-center gap-1.5">
                  <Flag emoji={s.bandeira_emoji} size="text-base" />
                  <span className={`truncate max-w-[72px] font-medium
                    ${s.posicao <= 2 ? 'text-white' : 'text-gray-400'}`}>
                    {s.nome_pt}
                  </span>
                </div>
              </td>
              <td className="py-1.5 text-right text-gray-500">{s.J}</td>
              <td className="py-1.5 text-right font-black text-white">{s.Pts}</td>
              <td className={`py-1.5 text-right font-medium
                ${s.SG > 0 ? 'text-green-400' : s.SG < 0 ? 'text-red-400' : 'text-gray-600'}`}>
                {s.SG > 0 ? `+${s.SG}` : s.SG}
              </td>
              <td className="py-1.5 text-right text-gray-500">{s.GP}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-3 mt-2 text-[9px] text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-copa-green inline-block" />Oitavas
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-copa-yellow inline-block" />Poss. melhor 3º
        </span>
      </div>
    </>
  )
}

// ── Seção de um grupo (6 jogos + tabela) ─────────────────────────────────────
function GrupoSection({ letra, jogos, palpites, standings, onPalpite, saveStatuses }) {
  return (
    <div id={`grupo-${letra}`} className="bg-copa-card border border-copa-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-copa-border flex items-center gap-2">
        <span className="text-copa-green font-black text-xs uppercase tracking-widest">Grupo</span>
        <span className="text-white font-black text-lg">{letra}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] divide-y lg:divide-y-0 lg:divide-x divide-copa-border">
        {/* Palpites */}
        <div className="p-4">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest font-semibold mb-3">Palpites</p>
          <div className="flex flex-col gap-0.5">
            {jogos.map(j => (
              <GameRow
                key={j.id}
                jogo={j}
                palpite={palpites[j.id]}
                onPalpite={onPalpite}
                saveStatus={saveStatuses[j.id]}
              />
            ))}
          </div>
        </div>

        {/* Classificação */}
        <div className="p-4">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest font-semibold mb-3">Classificação</p>
          <MiniTabela standings={standings} />
        </div>
      </div>
    </div>
  )
}

// ── Seletor / criador de bolões ───────────────────────────────────────────────
function BolaoSelector({ boloes, bolaoAtivo, onSelect, onCreate, onDelete }) {
  const [criando, setCriando] = useState(false)
  const [nome,    setNome]    = useState('')

  async function submit() {
    const n = nome.trim()
    if (!n) return
    await onCreate(n)
    setNome('')
    setCriando(false)
  }

  return (
    <div className="bg-copa-card border border-copa-border rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white text-sm font-bold">Meus Bolões</h2>
        <button
          onClick={() => setCriando(v => !v)}
          className="text-copa-green text-xs font-medium hover:underline"
        >
          {criando ? 'Cancelar' : '+ Novo bolão'}
        </button>
      </div>

      {criando && (
        <div className="flex gap-2 mb-3">
          <input
            autoFocus
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Ex: Família, Trabalho…"
            maxLength={60}
            className="flex-1 bg-copa-dark border border-copa-border rounded-lg px-3 py-2
                       text-gray-200 text-sm placeholder-gray-600
                       focus:outline-none focus:border-copa-green transition-colors"
          />
          <button
            onClick={submit}
            disabled={!nome.trim()}
            className="bg-copa-green text-white font-bold px-4 py-2 rounded-lg text-sm
                       hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Criar
          </button>
        </div>
      )}

      {boloes.length === 0 ? (
        <p className="text-gray-600 text-xs">Nenhum bolão ainda — crie o seu acima!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {boloes.map(b => (
            <div key={b.id} className="flex items-center gap-0.5">
              <button
                onClick={() => onSelect(b)}
                className={`px-3 py-1.5 text-sm rounded-l-lg border transition-colors
                  ${bolaoAtivo?.id === b.id
                    ? 'bg-copa-green border-copa-green text-white font-bold'
                    : 'bg-copa-dark border-copa-border text-gray-400 hover:text-white'}`}
              >
                {b.nome}
              </button>
              <button
                onClick={() => onDelete(b.id)}
                title="Excluir bolão"
                className={`px-2 py-1.5 rounded-r-lg border border-l-0 transition-colors
                  text-gray-600 hover:text-red-400 hover:border-red-900
                  ${bolaoAtivo?.id === b.id
                    ? 'border-copa-green bg-green-900/20'
                    : 'border-copa-border bg-copa-dark'}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function BolaoPage() {
  useEffect(() => { document.title = 'Bolão — Copa 2026' }, [])
  const [jogos,       setJogos]       = useState([])
  const [boloes,      setBoloes]      = useState([])
  const [bolaoAtivo,  setBolaoAtivo]  = useState(null)
  const [palpites,    setPalpites]    = useState({})   // { [jogo_id]: {gols_a, gols_b} }
  const [saveStatuses,setSaveStatuses]= useState({})   // { [jogo_id]: 'saving'|'saved' }
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [aba,         setAba]         = useState('grupos') // 'grupos' | 'matamata'

  const sessionId    = useRef(getSessionId())
  const saveTimeouts = useRef({})

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const fetchJson = async (url) => {
          const r = await fetch(url)
          if (!r.ok) throw new Error(`Erro ${r.status} ao carregar ${url}`)
          return r.json()
        }
        const [jogoData, bolaoData] = await Promise.all([
          fetchJson(`${API}/jogos?fase=grupo`),
          fetchJson(`${API}/boloes?session_id=${sessionId.current}`),
        ])
        const jogosArr  = Array.isArray(jogoData)  ? jogoData  : []
        const boloesArr = Array.isArray(bolaoData)  ? bolaoData : []
        setJogos(jogosArr)
        setBoloes(boloesArr)
        if (boloesArr.length > 0) await carregarBolao(boloesArr[0])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, []) // eslint-disable-line

  // ── Carregar bolão (limpa timeouts pendentes do bolão anterior) ───────────
  async function carregarBolao(bolao) {
    Object.values(saveTimeouts.current).forEach(clearTimeout)
    saveTimeouts.current = {}
    setBolaoAtivo(bolao)
    setPalpites({})
    setSaveStatuses({})
    try {
      const ps = await fetch(`${API}/boloes/${bolao.id}/palpites`).then(r => r.json())
      const map = {}
      ps.forEach(p => { map[p.jogo_id] = { gols_a: p.gols_a, gols_b: p.gols_b } })
      setPalpites(map)
    } catch { /* silencioso — palpites simplesmente não carregam */ }
  }

  async function handleCriar(nome) {
    const novo = await fetch(`${API}/boloes`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nome, session_id: sessionId.current }),
    }).then(r => r.json())
    setBoloes(prev => [novo, ...prev])
    await carregarBolao(novo)
  }

  async function handleDeletar(id) {
    await fetch(`${API}/boloes/${id}`, { method: 'DELETE' })
    setBoloes(prev => prev.filter(b => b.id !== id))
    if (bolaoAtivo?.id === id) {
      const resto = boloes.filter(b => b.id !== id)
      if (resto.length > 0) await carregarBolao(resto[0])
      else { setBolaoAtivo(null); setPalpites({}) }
    }
  }

  // ── Palpite com debounce 800ms ────────────────────────────────────────────
  function handlePalpite(jogoId, novoPalpite) {
    if (!bolaoAtivo) return
    setPalpites(prev => ({ ...prev, [jogoId]: novoPalpite }))
    setSaveStatuses(prev => ({ ...prev, [jogoId]: 'saving' }))

    if (saveTimeouts.current[jogoId]) clearTimeout(saveTimeouts.current[jogoId])

    saveTimeouts.current[jogoId] = setTimeout(async () => {
      try {
        await fetch(`${API}/boloes/${bolaoAtivo.id}/palpites`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jogo_id: jogoId,
            gols_a:  novoPalpite.gols_a ?? 0,
            gols_b:  novoPalpite.gols_b ?? 0,
          }),
        })
        setSaveStatuses(prev => ({ ...prev, [jogoId]: 'saved' }))
        setTimeout(() => {
          setSaveStatuses(prev => {
            const n = { ...prev }
            if (n[jogoId] === 'saved') delete n[jogoId]
            return n
          })
        }, 2000)
      } catch {
        setSaveStatuses(prev => { const n = { ...prev }; delete n[jogoId]; return n })
      }
    }, 800)
  }

  // ── Classificação em tempo real (calculada localmente) ────────────────────
  const standings = useMemo(
    () => (jogos.length > 0 ? calcularStandings(jogos, palpites) : {}),
    [jogos, palpites]
  )

  // ── Agrupa jogos por letra (A-L), ordenados por rodada ───────────────────
  const jogosPorGrupo = useMemo(() => {
    const g = {}
    jogos.forEach(j => {
      if (!g[j.grupo]) g[j.grupo] = []
      g[j.grupo].push(j)
    })
    Object.values(g).forEach(arr => arr.sort((a, b) => a.rodada - b.rodada))
    return g
  }, [jogos])

  const letras = Object.keys(jogosPorGrupo).sort()

  // ── Progresso ─────────────────────────────────────────────────────────────
  const totalPreenchidos = Object.values(palpites).filter(
    p => p && p.gols_a != null && p.gols_b != null
  ).length
  const totalJogos = jogos.length || 72
  const progresso  = Math.round((totalPreenchidos / totalJogos) * 100)

  // ── Salvando algum palpite? ───────────────────────────────────────────────
  const algumSalvando = Object.values(saveStatuses).some(s => s === 'saving')

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm animate-pulse">Carregando bolão…</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-center px-6">
      <div>
        <p className="text-gray-400 mb-1">Não foi possível carregar os dados.</p>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 max-w-6xl mx-auto">

      {/* Cabeçalho */}
      <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-white text-2xl sm:text-3xl font-bold mb-1">Bolão Copa 2026</h1>
          <p className="text-gray-500 text-sm">
            Palpite nos 72 jogos da fase de grupos e veja a classificação em tempo real.
          </p>
        </div>
        {bolaoAtivo && (
          <div className="flex items-center gap-2 text-xs shrink-0">
            {algumSalvando
              ? <span className="text-gray-500 animate-pulse">Salvando…</span>
              : <span className="text-gray-600">Auto-save ativo</span>
            }
          </div>
        )}
      </div>

      {/* Gestão de bolões */}
      <BolaoSelector
        boloes={boloes}
        bolaoAtivo={bolaoAtivo}
        onSelect={carregarBolao}
        onCreate={handleCriar}
        onDelete={handleDeletar}
      />

      {bolaoAtivo ? (
        <>
          {/* Seletor de aba */}
          <div className="flex gap-1 mb-6 bg-copa-card border border-copa-border rounded-xl p-1">
            {[
              { id: 'grupos',   label: 'Fase de Grupos' },
              { id: 'matamata', label: 'Mata-mata' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAba(tab.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors
                  ${aba === tab.id
                    ? 'bg-copa-green text-white'
                    : 'text-gray-400 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Aba Grupos ──────────────────────────────────────────────── */}
          {aba === 'grupos' && (
            <>
              {/* Barra de progresso */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-gray-500 text-xs">Palpites preenchidos</span>
                  <span className="text-gray-300 text-xs font-medium tabular-nums">
                    {totalPreenchidos} / {totalJogos}
                    <span className="text-gray-600 ml-1">({progresso}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-copa-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-copa-green rounded-full transition-all duration-500"
                    style={{ width: `${progresso}%` }}
                  />
                </div>
              </div>

              {/* Navegação rápida entre grupos */}
              <div className="flex flex-wrap gap-1 mb-5">
                {letras.map(l => {
                  const gPalpites = (jogosPorGrupo[l] ?? []).filter(j => palpites[j.id] != null).length
                  const gTotal    = (jogosPorGrupo[l] ?? []).length
                  const completo  = gPalpites === gTotal && gTotal > 0
                  return (
                    <a
                      key={l}
                      href={`#grupo-${l}`}
                      onClick={e => {
                        e.preventDefault()
                        document.getElementById(`grupo-${l}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black
                        border transition-colors
                        ${completo
                          ? 'bg-copa-green/20 border-copa-green text-copa-green'
                          : 'bg-copa-card border-copa-border text-gray-400 hover:text-white'}`}
                    >
                      {l}
                    </a>
                  )
                })}
              </div>

              {/* Grupos A–L */}
              <div className="flex flex-col gap-4">
                {letras.map(l => (
                  <GrupoSection
                    key={l}
                    letra={l}
                    jogos={jogosPorGrupo[l] ?? []}
                    palpites={palpites}
                    standings={standings[l]}
                    onPalpite={handlePalpite}
                    saveStatuses={saveStatuses}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── Aba Mata-mata ────────────────────────────────────────────── */}
          {aba === 'matamata' && (
            <div className="bg-copa-card border border-copa-border rounded-xl p-4 sm:p-6">
              <Chaveamento bolaoId={bolaoAtivo.id} />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏆</p>
          <p className="text-white text-lg font-bold mb-2">Crie um bolão para começar!</p>
          <p className="text-gray-500 text-sm">
            Palpite nos 72 jogos da fase de grupos e descubra seu campeão.
          </p>
        </div>
      )}
    </div>
  )
}
