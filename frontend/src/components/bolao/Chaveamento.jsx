import { useState, useEffect, useRef, useMemo } from 'react'
import Flag from '../Flag'

const API = 'http://localhost:8000/api'

// ── Lógica local de vencedor (espelha backend) ────────────────────────────────
function determinarVencedor(ta, tb, p = {}) {
  if (!ta || !tb) return { vencedor: null, perdedor: null }
  const { gols_a: ga, gols_b: gb, penaltis_a: pa, penaltis_b: pb } = p
  if (ga == null || gb == null) return { vencedor: null, perdedor: null }
  const gaN = Number(ga), gbN = Number(gb)
  if (isNaN(gaN) || isNaN(gbN)) return { vencedor: null, perdedor: null }
  if (gaN > gbN) return { vencedor: ta, perdedor: tb }
  if (gbN > gaN) return { vencedor: tb, perdedor: ta }
  if (pa != null && pb != null) {
    const paN = Number(pa), pbN = Number(pb)
    if (paN > pbN) return { vencedor: ta, perdedor: tb }
    if (pbN > paN) return { vencedor: tb, perdedor: ta }
  }
  return { vencedor: null, perdedor: null }
}

function calcularBracketLocal(r32Base, palpitesMata) {
  function enrich(m) {
    const p = palpitesMata[m.id] !== undefined ? palpitesMata[m.id] : (m.palpite || {})
    const { vencedor, perdedor } = determinarVencedor(m.selecao_a, m.selecao_b, p)
    return { ...m, palpite: p, vencedor, perdedor }
  }

  function mm(id, ta, tb) {
    const p = palpitesMata[id] !== undefined ? palpitesMata[id] : {}
    const { vencedor, perdedor } = determinarVencedor(ta || null, tb || null, p)
    return { id, selecao_a: ta || null, selecao_b: tb || null, palpite: p, vencedor, perdedor }
  }

  const r32 = r32Base.map(m => enrich({ ...m }))
  const w32 = r32.map(m => m.vencedor)

  const r16 = [
    mm('r16_m1', w32[0],  w32[1]),
    mm('r16_m2', w32[2],  w32[3]),
    mm('r16_m3', w32[4],  w32[5]),
    mm('r16_m4', w32[6],  w32[7]),
    mm('r16_m5', w32[8],  w32[9]),
    mm('r16_m6', w32[10], w32[11]),
    mm('r16_m7', w32[12], w32[13]),
    mm('r16_m8', w32[14], w32[15]),
  ]
  const w16 = r16.map(m => m.vencedor)

  const qf = [
    mm('qf_m1', w16[0], w16[1]),
    mm('qf_m2', w16[2], w16[3]),
    mm('qf_m3', w16[4], w16[5]),
    mm('qf_m4', w16[6], w16[7]),
  ]
  const wqf = qf.map(m => m.vencedor)
  const lqf = qf.map(m => m.perdedor)

  const sf = [
    mm('sf_m1', wqf[0], wqf[1]),
    mm('sf_m2', wqf[2], wqf[3]),
  ]
  const wsf = sf.map(m => m.vencedor)
  const lsf = sf.map(m => m.perdedor)

  return {
    rodada_32: r32,
    oitavas:   r16,
    quartas:   qf,
    semi:      sf,
    terceiro:  [mm('terceiro', lsf[0], lsf[1])],
    final:     [mm('final',    wsf[0], wsf[1])],
  }
}

// ── Stepper de placar compacto ────────────────────────────────────────────────
function ScoreStep({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(Math.max(0, (value ?? 0) - 1))}
        className="w-4 h-4 flex items-center justify-center rounded bg-white/10
                   text-white text-[10px] hover:bg-white/20 disabled:opacity-30 select-none"
      >−</button>
      <input
        type="text"
        inputMode="numeric"
        disabled={disabled}
        value={value ?? ''}
        onChange={e => {
          const v = parseInt(e.target.value.replace(/\D/, ''))
          onChange(isNaN(v) ? null : Math.min(20, Math.max(0, v)))
        }}
        className="w-6 text-center bg-transparent text-white font-mono text-xs font-black
                   border-b border-copa-border focus:border-copa-green outline-none
                   disabled:opacity-30"
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(Math.min(20, (value ?? -1) + 1))}
        className="w-4 h-4 flex items-center justify-center rounded bg-white/10
                   text-white text-[10px] hover:bg-white/20 disabled:opacity-30 select-none"
      >+</button>
    </div>
  )
}

// ── Card de confronto ─────────────────────────────────────────────────────────
function MatchCard({ match, onPalpite, gold = false }) {
  const { id, selecao_a: ta, selecao_b: tb, palpite: p = {}, vencedor } = match
  const isDefined = ta && tb
  const ga = p.gols_a ?? null
  const gb = p.gols_b ?? null
  const pa = p.penaltis_a ?? null
  const pb = p.penaltis_b ?? null
  const isTie = isDefined && ga != null && gb != null && Number(ga) === Number(gb)

  function update(field, val) {
    if (!isDefined) return
    onPalpite(id, { ...p, [field]: val })
  }

  const isWinnerA = vencedor?.id === ta?.id
  const isWinnerB = vencedor?.id === tb?.id

  return (
    <div
      className={`rounded-lg overflow-hidden bg-copa-card shrink-0
        ${gold
          ? 'border border-copa-gold/50 shadow-[0_0_16px_rgba(200,169,81,0.12)]'
          : vencedor
            ? 'border border-copa-green/30'
            : 'border border-copa-border'
        }`}
      style={{ width: '210px' }}
    >
      {/* Time A */}
      <div className={`flex items-center gap-1.5 px-2 py-1.5
        ${isWinnerA ? 'bg-copa-green/10' : ''}`}>
        <span className="w-5 text-center flex justify-center">
          <Flag emoji={ta?.bandeira_emoji} size="text-sm" />
        </span>
        <span className={`text-[11px] flex-1 truncate font-medium
          ${!ta ? 'text-gray-600 italic' : isWinnerA ? 'text-copa-green font-bold' : 'text-gray-200'}`}>
          {ta?.nome_pt || 'A definir'}
        </span>
        <ScoreStep value={ga} disabled={!isDefined} onChange={v => update('gols_a', v)} />
      </div>

      {/* Divisor */}
      <div className="h-px bg-copa-border mx-2" />

      {/* Time B */}
      <div className={`flex items-center gap-1.5 px-2 py-1.5
        ${isWinnerB ? 'bg-copa-green/10' : ''}`}>
        <span className="w-5 text-center flex justify-center">
          <Flag emoji={tb?.bandeira_emoji} size="text-sm" />
        </span>
        <span className={`text-[11px] flex-1 truncate font-medium
          ${!tb ? 'text-gray-600 italic' : isWinnerB ? 'text-copa-green font-bold' : 'text-gray-200'}`}>
          {tb?.nome_pt || 'A definir'}
        </span>
        <ScoreStep value={gb} disabled={!isDefined} onChange={v => update('gols_b', v)} />
      </div>

      {/* Pênaltis — aparece só em empate com placar preenchido */}
      {isTie && (
        <div className="px-2 pb-1.5 pt-1 border-t border-copa-border bg-copa-yellow/5">
          <p className="text-[9px] text-copa-yellow uppercase tracking-widest font-semibold mb-1">
            Pênaltis
          </p>
          <div className="flex items-center gap-1">
            <ScoreStep value={pa} onChange={v => update('penaltis_a', v)} />
            <span className="text-gray-600 text-xs mx-0.5">×</span>
            <ScoreStep value={pb} onChange={v => update('penaltis_b', v)} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Coluna de uma fase ────────────────────────────────────────────────────────
// justify-around em container de altura fixa garante alinhamento matemático:
// com N cards e coluna de 1280px, cada card fica centralizado em (i+0.5)*1280/N px
function BracketColumn({ title, matches, onPalpite, colHeight = 1280, gold = false }) {
  return (
    <div className="flex flex-col shrink-0" style={{ width: '210px' }}>
      <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-2">
        {title}
      </p>
      <div
        className="flex flex-col justify-around"
        style={{ height: `${colHeight}px` }}
      >
        {matches.map(m => (
          <div key={m.id} className="flex justify-center">
            <MatchCard match={m} onPalpite={onPalpite} gold={gold} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function Chaveamento({ bolaoId }) {
  const [r32Base,      setR32Base]      = useState([])
  const [palpitesMata, setPalpitesMata] = useState({})
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const saveTimeouts = useRef({})

  const COL_H = 1280 // altura das colunas em px (16 jogos × 80 px/slot)

  // ── Busca bracket do backend ───────────────────────────────────────────────
  async function fetchBracket() {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`${API}/boloes/${bolaoId}/chaveamento`)
      if (!r.ok) throw new Error(`Erro ${r.status}`)
      const data = await r.json()

      setR32Base(Array.isArray(data.rodada_32) ? data.rodada_32 : [])

      // Inicializa palpites locais com todos os salvos (de todas as fases)
      const init = {}
      const allMatches = [
        ...(data.rodada_32  || []),
        ...(data.oitavas    || []),
        ...(data.quartas    || []),
        ...(data.semi       || []),
        ...(data.terceiro   || []),
        ...(data.final      || []),
      ]
      allMatches.forEach(m => {
        if (m.palpite && (m.palpite.gols_a != null || m.palpite.gols_b != null)) {
          init[m.id] = m.palpite
        }
      })
      setPalpitesMata(init)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bolaoId) fetchBracket()
    return () => Object.values(saveTimeouts.current).forEach(clearTimeout)
  }, [bolaoId]) // eslint-disable-line

  // ── Salvar palpite (debounce 800 ms) ──────────────────────────────────────
  function handlePalpite(matchId, palpite) {
    setPalpitesMata(prev => ({ ...prev, [matchId]: palpite }))

    if (saveTimeouts.current[matchId]) clearTimeout(saveTimeouts.current[matchId])
    saveTimeouts.current[matchId] = setTimeout(async () => {
      try {
        await fetch(`${API}/boloes/${bolaoId}/chaveamento/palpite`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ match_id: matchId, ...palpite }),
        })
      } catch { /* falha silenciosa */ }
    }, 800)
  }

  // ── Bracket calculado localmente ───────────────────────────────────────────
  const bracket = useMemo(
    () => (r32Base.length > 0 ? calcularBracketLocal(r32Base, palpitesMata) : null),
    [r32Base, palpitesMata],
  )

  // ── Progresso: seleções classificadas (com vencedor determinado) ──────────
  const classificados = useMemo(() => {
    if (!bracket) return 0
    return bracket.rodada_32.filter(m => m.vencedor).length
  }, [bracket])

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-500 text-sm animate-pulse">Calculando chaveamento…</p>
    </div>
  )

  if (error) return (
    <div className="text-center py-16">
      <p className="text-gray-400 mb-1">Não foi possível calcular o chaveamento.</p>
      <p className="text-gray-600 text-sm mb-4">{error}</p>
      <button
        onClick={fetchBracket}
        className="text-copa-green text-sm hover:underline"
      >
        Tentar novamente
      </button>
    </div>
  )

  if (!bracket) return (
    <div className="text-center py-16">
      <p className="text-gray-500 text-sm">Preencha palpites na fase de grupos para ver o chaveamento.</p>
    </div>
  )

  const { rodada_32, oitavas, quartas, semi, terceiro, final: finalMatch } = bracket

  return (
    <div>
      {/* Barra de status */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-xs">
          <span className="text-white font-medium">{classificados}</span>/16 confrontos
          da Rodada de 32 com vencedor definido
        </p>
        <button
          onClick={fetchBracket}
          className="text-[11px] text-gray-600 hover:text-copa-green transition-colors"
          title="Recalcular equipes com base nos palpites da fase de grupos"
        >
          ↺ Recalcular equipes
        </button>
      </div>

      {/* ── Bracket horizontal ────────────────────────────────────────────── */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-max">

          {/* Rodada de 32 */}
          <BracketColumn
            title="Rodada de 32"
            matches={rodada_32}
            onPalpite={handlePalpite}
            colHeight={COL_H}
          />

          {/* Seta */}
          <div className="flex flex-col justify-around shrink-0" style={{ height: `${COL_H}px`, width: '8px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full border-t border-dashed border-copa-border opacity-40" />
              </div>
            ))}
          </div>

          {/* Oitavas */}
          <BracketColumn
            title="Oitavas"
            matches={oitavas}
            onPalpite={handlePalpite}
            colHeight={COL_H}
          />

          {/* Seta */}
          <div className="flex flex-col justify-around shrink-0" style={{ height: `${COL_H}px`, width: '8px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full border-t border-dashed border-copa-border opacity-40" />
              </div>
            ))}
          </div>

          {/* Quartas */}
          <BracketColumn
            title="Quartas"
            matches={quartas}
            onPalpite={handlePalpite}
            colHeight={COL_H}
          />

          {/* Seta */}
          <div className="flex flex-col justify-around shrink-0" style={{ height: `${COL_H}px`, width: '8px' }}>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className="w-full border-t border-dashed border-copa-border opacity-40" />
              </div>
            ))}
          </div>

          {/* Semifinais */}
          <BracketColumn
            title="Semifinais"
            matches={semi}
            onPalpite={handlePalpite}
            colHeight={COL_H}
          />

          {/* Seta */}
          <div className="flex flex-col justify-around shrink-0" style={{ height: `${COL_H}px`, width: '8px' }}>
            <div className="flex-1 flex items-center">
              <div className="w-full border-t border-dashed border-copa-border opacity-40" />
            </div>
          </div>

          {/* Final — 1 jogo centralizado em 640 px (metade de 1280) */}
          <BracketColumn
            title="🏆 Final"
            matches={finalMatch}
            onPalpite={handlePalpite}
            colHeight={COL_H}
            gold
          />
        </div>
      </div>

      {/* ── Disputa do 3º Lugar (fora do bracket principal) ─────────────── */}
      <div className="mt-2 pt-6 border-t border-copa-border">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold mb-3">
          Disputa do 3° Lugar
        </p>
        <div className="flex justify-start">
          <MatchCard match={terceiro[0]} onPalpite={handlePalpite} />
        </div>
        <p className="text-[10px] text-gray-700 mt-2">
          Perdedores das semifinais disputam o 3° lugar.
        </p>
      </div>
    </div>
  )
}
