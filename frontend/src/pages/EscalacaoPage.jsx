import { useState, useEffect, useRef } from 'react'

const API = 'http://localhost:8000/api'

// ── Session ID (persiste na aba) ─────────────────────────────────────────────
function getSessionId() {
  const KEY = 'copa2026_sid'
  let id = sessionStorage.getItem(KEY)
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(KEY, id) }
  return id
}

// ── Abreviação para exibir no slot do campo ──────────────────────────────────
function nomeShort(nome) {
  if (!nome) return ''
  const parts = nome.trim().split(' ')
  // Ex: "Gabriel Magalhães" → "Gabriel" / "Vinícius Jr." → "Vinícius"
  return parts[0].length >= 4 ? parts[0] : `${parts[0]} ${parts[1] ?? ''}`.trim()
}

// ── Definições de formação: 11 slots com posição e coordenadas (x/y em %) ───
// y=0% = gol atacado (topo), y=100% = gol próprio (base)
// GK fica em y≈88%, DEF em y≈70%, MID em y≈50%, FWD em y≈18-22%
const FORMACOES = {
  '4-3-3': [
    { label:'GL', pos:'GK',  x:50, y:88 },
    { label:'LD', pos:'DEF', x:15, y:70 }, { label:'ZD', pos:'DEF', x:36, y:70 },
    { label:'ZE', pos:'DEF', x:64, y:70 }, { label:'LE', pos:'DEF', x:85, y:70 },
    { label:'MD', pos:'MID', x:22, y:50 }, { label:'MC', pos:'MID', x:50, y:50 }, { label:'ME', pos:'MID', x:78, y:50 },
    { label:'PD', pos:'FWD', x:18, y:22 }, { label:'CA', pos:'FWD', x:50, y:16 }, { label:'PE', pos:'FWD', x:82, y:22 },
  ],
  '4-4-2': [
    { label:'GL',  pos:'GK',  x:50, y:88 },
    { label:'LD',  pos:'DEF', x:15, y:70 }, { label:'ZD', pos:'DEF', x:36, y:70 },
    { label:'ZE',  pos:'DEF', x:64, y:70 }, { label:'LE', pos:'DEF', x:85, y:70 },
    { label:'MD',  pos:'MID', x:15, y:50 }, { label:'MCD',pos:'MID', x:38, y:50 },
    { label:'MCE', pos:'MID', x:62, y:50 }, { label:'ME', pos:'MID', x:85, y:50 },
    { label:'CAD', pos:'FWD', x:35, y:20 }, { label:'CAE',pos:'FWD', x:65, y:20 },
  ],
  '4-2-3-1': [
    { label:'GL',  pos:'GK',  x:50, y:88 },
    { label:'LD',  pos:'DEF', x:15, y:70 }, { label:'ZD', pos:'DEF', x:36, y:70 },
    { label:'ZE',  pos:'DEF', x:64, y:70 }, { label:'LE', pos:'DEF', x:85, y:70 },
    { label:'VOL', pos:'MID', x:36, y:60 }, { label:'VOL',pos:'MID', x:64, y:60 },
    { label:'ME',  pos:'MID', x:15, y:40 }, { label:'MAM',pos:'MID', x:50, y:38 }, { label:'MD', pos:'MID', x:85, y:40 },
    { label:'CA',  pos:'FWD', x:50, y:16 },
  ],
  '3-5-2': [
    { label:'GL',  pos:'GK',  x:50, y:88 },
    { label:'ZD',  pos:'DEF', x:22, y:70 }, { label:'Z',  pos:'DEF', x:50, y:70 }, { label:'ZE', pos:'DEF', x:78, y:70 },
    { label:'LD',  pos:'MID', x: 9, y:50 }, { label:'MCD',pos:'MID', x:29, y:50 },
    { label:'MC',  pos:'MID', x:50, y:50 },
    { label:'MCE', pos:'MID', x:71, y:50 }, { label:'LE', pos:'MID', x:91, y:50 },
    { label:'CAD', pos:'FWD', x:35, y:20 }, { label:'CAE',pos:'FWD', x:65, y:20 },
  ],
  '5-3-2': [
    { label:'GL',  pos:'GK',  x:50, y:88 },
    { label:'LD',  pos:'DEF', x: 9, y:70 }, { label:'ZD', pos:'DEF', x:27, y:70 },
    { label:'Z',   pos:'DEF', x:50, y:70 },
    { label:'ZE',  pos:'DEF', x:73, y:70 }, { label:'LE', pos:'DEF', x:91, y:70 },
    { label:'MD',  pos:'MID', x:22, y:50 }, { label:'MC', pos:'MID', x:50, y:50 }, { label:'ME', pos:'MID', x:78, y:50 },
    { label:'CAD', pos:'FWD', x:35, y:20 }, { label:'CAE',pos:'FWD', x:65, y:20 },
  ],
  '4-1-4-1': [
    { label:'GL',  pos:'GK',  x:50, y:88 },
    { label:'LD',  pos:'DEF', x:15, y:70 }, { label:'ZD', pos:'DEF', x:36, y:70 },
    { label:'ZE',  pos:'DEF', x:64, y:70 }, { label:'LE', pos:'DEF', x:85, y:70 },
    { label:'VOL', pos:'MID', x:50, y:60 },
    { label:'MD',  pos:'MID', x:12, y:46 }, { label:'MCD',pos:'MID', x:36, y:46 },
    { label:'MCE', pos:'MID', x:64, y:46 }, { label:'ME', pos:'MID', x:88, y:46 },
    { label:'CA',  pos:'FWD', x:50, y:16 },
  ],
  '3-4-3': [
    { label:'GL',  pos:'GK',  x:50, y:88 },
    { label:'ZD',  pos:'DEF', x:22, y:70 }, { label:'Z',  pos:'DEF', x:50, y:70 }, { label:'ZE', pos:'DEF', x:78, y:70 },
    { label:'LD',  pos:'MID', x:12, y:50 }, { label:'MCD',pos:'MID', x:36, y:50 },
    { label:'MCE', pos:'MID', x:64, y:50 }, { label:'LE', pos:'MID', x:88, y:50 },
    { label:'PD',  pos:'FWD', x:18, y:22 }, { label:'CA', pos:'FWD', x:50, y:16 }, { label:'PE', pos:'FWD', x:82, y:22 },
  ],
}

const LISTA_FORMACOES = ['4-3-3','4-4-2','4-2-3-1','3-5-2','5-3-2','4-1-4-1','3-4-3']

const POS_STYLE = {
  GK:  'bg-yellow-900/60 text-yellow-400 border-yellow-700/60',
  DEF: 'bg-blue-900/60   text-blue-400   border-blue-700/60',
  MID: 'bg-green-900/60  text-green-400  border-green-700/60',
  FWD: 'bg-red-900/60    text-red-400    border-red-700/60',
}
const POS_LABEL = { GK:'Goleiro', DEF:'Defensores', MID:'Meias', FWD:'Atacantes' }

// ── Constrói os 11 slots de uma formação (todos vazios) ──────────────────────
function buildSlots(formacao) {
  return FORMACOES[formacao].map((def, idx) => ({ ...def, idx, jogador: null }))
}

// Migra jogadores dos slots atuais para os slots da nova formação
function migrarSlots(novosSlots, slotsAtuais) {
  const byPos = { GK: [], DEF: [], MID: [], FWD: [] }
  slotsAtuais.forEach(s => { if (s.jogador) byPos[s.pos]?.push(s.jogador) })
  novosSlots.forEach(s => { s.jogador = byPos[s.pos]?.shift() ?? null })
  return novosSlots
}

// ── Sub-componente: badge de posição ─────────────────────────────────────────
function PosBadge({ pos }) {
  return (
    <span className={`text-[9px] font-bold px-1 py-px rounded border ${POS_STYLE[pos] ?? ''}`}>
      {pos}
    </span>
  )
}

// ── Sub-componente: slot no campo ─────────────────────────────────────────────
function Slot({ slot, isDragOver, onDragStart, onDragOver, onDragLeave, onDrop, onClick, onRemove }) {
  const temJogador = !!slot.jogador

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[3px] select-none"
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, zIndex: temJogador ? 10 : 5 }}
      onDragOver={e => { e.preventDefault(); onDragOver(slot.idx) }}
      onDragLeave={onDragLeave}
      onDrop={e => { e.preventDefault(); onDrop(slot.idx) }}
      onClick={() => temJogador ? onRemove(slot.idx) : onClick(slot.idx)}
    >
      {/* Círculo principal */}
      <div
        draggable={temJogador}
        onDragStart={temJogador ? e => onDragStart(e, slot.jogador, slot.idx) : undefined}
        className={[
          'w-9 h-9 rounded-full border-2 flex items-center justify-center',
          'text-xs font-black cursor-pointer transition-all duration-150',
          temJogador
            ? 'bg-copa-green border-copa-green text-white shadow-lg shadow-green-900/60 hover:scale-110 hover:border-white'
            : isDragOver
              ? 'bg-white/20 border-white text-white scale-105'
              : 'bg-black/50 border-white/30 text-white/50 hover:border-white/60 hover:bg-white/10',
        ].join(' ')}
      >
        {temJogador ? (slot.jogador.numero ?? '?') : slot.label}
      </div>

      {/* Nome abaixo do círculo */}
      <span
        className={[
          'text-[9px] font-semibold leading-none max-w-[56px] text-center truncate',
          'drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]',
          temJogador ? 'text-white' : 'text-transparent',
        ].join(' ')}
      >
        {temJogador ? nomeShort(slot.jogador.nome) : '·'}
      </span>
    </div>
  )
}

// ── Sub-componente: campo de futebol ─────────────────────────────────────────
function CampoFutebol({ slots, dragOverSlot, onDragStart, onDragOver, onDragLeave, onDrop, onSlotClick, onSlotRemove, onDropOnPanel }) {
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-white/10 shadow-2xl"
      style={{ aspectRatio: '2/3' }}
      onDragOver={e => e.preventDefault()}
      onDrop={e => { e.preventDefault(); onDropOnPanel() }}  // drop fora de slot = remover
    >
      {/* Gramado */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a6b2e] to-[#0f4a1e]" />

      {/* Linhas do campo (SVG decorativo) */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 200 300"
        preserveAspectRatio="none"
      >
        {/* Borda */}
        <rect x="6" y="6" width="188" height="288" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        {/* Linha central */}
        <line x1="6" y1="150" x2="194" y2="150" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {/* Círculo central */}
        <circle cx="100" cy="150" r="25" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <circle cx="100" cy="150" r="1.5" fill="rgba(255,255,255,0.4)" />
        {/* Área grande — ataque (topo) */}
        <rect x="38" y="6" width="124" height="48" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {/* Área pequena — ataque */}
        <rect x="66" y="6" width="68" height="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {/* Gol — ataque */}
        <rect x="84" y="2" width="32" height="6" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        {/* Ponto pênalti ataque */}
        <circle cx="100" cy="38" r="1.5" fill="rgba(255,255,255,0.4)" />
        {/* Arco pênalti ataque */}
        <path d="M 58 54 A 25 25 0 0 0 142 54" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        {/* Área grande — defesa (base) */}
        <rect x="38" y="246" width="124" height="48" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {/* Área pequena — defesa */}
        <rect x="66" y="274" width="68" height="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        {/* Gol — defesa */}
        <rect x="84" y="292" width="32" height="6" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        {/* Ponto pênalti defesa */}
        <circle cx="100" cy="262" r="1.5" fill="rgba(255,255,255,0.4)" />
        {/* Arco pênalti defesa */}
        <path d="M 58 246 A 25 25 0 0 1 142 246" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        {/* Cantos */}
        {[
          'M 6 6 Q 6 14 14 6', 'M 194 6 Q 194 14 186 6',
          'M 6 294 Q 6 286 14 294', 'M 194 294 Q 194 286 186 294',
        ].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        ))}
      </svg>

      {/* Slots de jogadores */}
      {slots.map(slot => (
        <Slot
          key={slot.idx}
          slot={slot}
          isDragOver={dragOverSlot === slot.idx}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={onSlotClick}
          onRemove={onSlotRemove}
        />
      ))}
    </div>
  )
}

// ── Sub-componente: painel lateral de jogadores disponíveis ──────────────────
function PainelJogadores({ jogadores, jogadoresNosSlots, filtroPos, onFiltroPos, onDragStart, onClickJogador }) {
  const disponiveis = jogadores.filter(j => !jogadoresNosSlots.has(j.id))
  const filtrados   = filtroPos ? disponiveis.filter(j => j.posicao === filtroPos) : disponiveis

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Filtros de posição */}
      <div className="flex flex-wrap gap-1 mb-3 shrink-0">
        {[['','Todos'], ...Object.entries(POS_LABEL)].map(([v, l]) => (
          <button
            key={v}
            onClick={() => onFiltroPos(v)}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors
              ${filtroPos === v
                ? 'bg-copa-green border-copa-green text-white'
                : 'bg-copa-card border-copa-border text-gray-400 hover:text-white'}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="overflow-y-auto flex flex-col gap-1 pr-0.5 min-h-0">
        {filtrados.length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-6">
            {disponiveis.length === 0 ? 'Todos em campo!' : 'Nenhum jogador nessa posição.'}
          </p>
        ) : filtrados.map(j => (
          <div
            key={j.id}
            draggable
            onDragStart={e => onDragStart(e, j, null)}
            onClick={() => onClickJogador(j)}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-copa-card border border-copa-border
                       cursor-grab active:cursor-grabbing hover:border-copa-green hover:bg-green-900/10
                       transition-colors select-none"
          >
            <span className="text-copa-yellow font-mono text-xs w-5 text-right shrink-0">
              {j.numero ?? '—'}
            </span>
            <span className="text-gray-200 text-xs flex-1 truncate">{j.nome}</span>
            {j.eh_capitao ? <span className="text-copa-yellow text-[10px] shrink-0">(C)</span> : null}
            <PosBadge pos={j.posicao} />
          </div>
        ))}
      </div>

      {/* Contagem */}
      <p className="text-gray-700 text-xs text-right mt-2 shrink-0">
        {disponiveis.length} disponíveis · {jogadores.length - disponiveis.length} em campo
      </p>
    </div>
  )
}

// ── Sub-componente: modal mobile para escolher jogador ───────────────────────
function ModalEscolher({ aberto, jogadores, onEscolher, onFechar }) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center"
         onClick={onFechar}>
      <div
        className="bg-copa-card border border-copa-border rounded-t-2xl sm:rounded-2xl w-full max-w-sm max-h-[75vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-copa-border shrink-0">
          <h3 className="text-white font-bold text-sm">Escolher jogador</h3>
          <button onClick={onFechar} className="text-gray-500 hover:text-white text-lg leading-none">×</button>
        </div>
        <div className="overflow-y-auto p-3 flex flex-col gap-1">
          {jogadores.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">Nenhum jogador disponível.</p>
          ) : jogadores.map(j => (
            <button
              key={j.id}
              onClick={() => { onEscolher(j); onFechar() }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-white/10 text-left transition-colors"
            >
              <span className="text-copa-yellow font-mono text-xs w-5 text-right">{j.numero ?? '—'}</span>
              <span className="text-gray-200 text-sm flex-1">{j.nome}</span>
              {j.eh_capitao ? <span className="text-copa-yellow text-[10px]">(C)</span> : null}
              <PosBadge pos={j.posicao} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Sub-componente: lista de escalações salvas ────────────────────────────────
function EscalacoesSalvas({ escalacoes, onCarregar, onDeletar }) {
  if (escalacoes.length === 0) return null
  return (
    <div className="mt-6">
      <h3 className="text-gray-400 text-xs uppercase tracking-widest font-semibold mb-3">Escalações salvas</h3>
      <div className="flex flex-col gap-2">
        {escalacoes.map(e => (
          <div key={e.id}
               className="flex items-center gap-3 bg-copa-card border border-copa-border rounded-xl px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{e.nome}</p>
              <p className="text-gray-600 text-xs">{e.formacao} · {new Date(e.criado_em).toLocaleDateString('pt-BR')}</p>
            </div>
            <button
              onClick={() => onCarregar(e)}
              className="text-copa-green text-xs font-medium hover:underline shrink-0"
            >
              Carregar
            </button>
            <button
              onClick={() => onDeletar(e.id)}
              className="text-gray-600 hover:text-red-400 text-xs shrink-0"
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function EscalacaoPage() {
  useEffect(() => { document.title = 'Escalação do Brasil — Copa 2026' }, [])
  const [formacao,    setFormacao]    = useState('4-3-3')
  const [slots,       setSlots]       = useState(() => buildSlots('4-3-3'))
  const [jogadores,   setJogadores]   = useState([])
  const [escalacoes,  setEscalacoes]  = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [dragging,    setDragging]    = useState(null)    // { jogador, fromSlotIdx }
  const [dragOverSlot,setDragOverSlot]= useState(null)
  const [filtroPos,   setFiltroPos]   = useState('')
  const [modalSlotIdx,setModalSlotIdx]= useState(null)
  const [nomeSalvar,  setNomeSalvar]  = useState('Minha Escalação')
  const [salvando,    setSalvando]    = useState(false)
  const [aviso,       setAviso]       = useState('')

  const sessionId = useRef(getSessionId())

  // ── Carrega elenco do Brasil e escalações salvas ─────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const sels = await fetch(`${API}/selecoes`).then(r => r.json())
        const brasil = sels.find(s => s.nome_pt === 'Brasil')
        if (!brasil) throw new Error('Seleção Brasil não encontrada na API')

        const jogs = await fetch(`${API}/selecoes/${brasil.id}/jogadores`).then(r => r.json())
        setJogadores(jogs)

        const escs = await fetch(`${API}/escalacoes?session_id=${sessionId.current}`).then(r => r.json())
        setEscalacoes(escs)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // ── Troca de formação: migra jogadores por posição ───────────────────────
  function handleFormacao(nova) {
    const novosSlots = migrarSlots(buildSlots(nova), slots)
    setSlots(novosSlots)
    setFormacao(nova)
  }

  // ── Drag & Drop handlers ─────────────────────────────────────────────────
  function handleDragStart(e, jogador, fromSlotIdx) {
    setDragging({ jogador, fromSlotIdx: fromSlotIdx ?? null })
    e.dataTransfer.setData('text/plain', String(jogador.id))
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOverSlot(slotIdx) {
    setDragOverSlot(slotIdx)
  }

  function handleDragLeave() {
    setDragOverSlot(null)
  }

  function handleDropOnSlot(slotIdx) {
    if (!dragging) return
    setDragOverSlot(null)

    setSlots(prev => {
      const next = prev.map(s => ({ ...s }))
      // Limpa slot de origem
      if (dragging.fromSlotIdx !== null) {
        next[dragging.fromSlotIdx].jogador = null
      }
      // Se o slot alvo já tem jogador, devolve ao painel (limpa)
      // (simplesmente sobreescreve — o antigo fica disponível no painel)
      next[slotIdx].jogador = dragging.jogador
      return next
    })
    setDragging(null)
  }

  // Drop fora de qualquer slot = remove do slot de origem
  function handleDropOnPanel() {
    if (!dragging || dragging.fromSlotIdx === null) { setDragging(null); return }
    setSlots(prev => {
      const next = prev.map(s => ({ ...s }))
      next[dragging.fromSlotIdx].jogador = null
      return next
    })
    setDragging(null)
    setDragOverSlot(null)
  }

  // ── Click em slot (mobile fallback + desktop alternativo) ─────────────────
  function handleSlotClick(slotIdx) {
    // Abre modal com jogadores disponíveis (filtrados pela posição do slot)
    setModalSlotIdx(slotIdx)
  }

  function handleSlotRemove(slotIdx) {
    setSlots(prev => {
      const next = prev.map(s => ({ ...s }))
      next[slotIdx].jogador = null
      return next
    })
  }

  function handleModalEscolher(jogador) {
    if (modalSlotIdx === null) return
    setSlots(prev => {
      const next = prev.map(s => ({ ...s }))
      // Remove de slot anterior se estiver em campo
      const slotAtual = next.findIndex(s => s.jogador?.id === jogador.id)
      if (slotAtual !== -1) next[slotAtual].jogador = null
      next[modalSlotIdx].jogador = jogador
      return next
    })
  }

  // Click em jogador do painel: coloca no primeiro slot vazio da mesma posição
  function handlePainelClick(jogador) {
    const slotVazio = slots.find(s => !s.jogador && s.pos === jogador.posicao)
    if (!slotVazio) { setModalSlotIdx(slots.findIndex(s => !s.jogador)); return }
    setSlots(prev => {
      const next = prev.map(s => ({ ...s }))
      next[slotVazio.idx].jogador = jogador
      return next
    })
  }

  // ── Salvar ───────────────────────────────────────────────────────────────
  async function handleSalvar() {
    const titulares = slots.filter(s => s.jogador)
    if (titulares.length < 11) {
      setAviso(`Faltam ${11 - titulares.length} titular(es) para completar a escalação.`)
      return
    }
    setAviso('')
    setSalvando(true)
    try {
      const payload = {
        nome:           nomeSalvar || 'Minha Escalação',
        formacao,
        jogadores_json: JSON.stringify(slots.map(s => ({
          idx:       s.idx,
          jogador_id: s.jogador?.id ?? null,
        }))),
        session_id: sessionId.current,
      }
      const res = await fetch(`${API}/escalacoes`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const nova = await res.json()
      setEscalacoes(prev => [nova, ...prev])
    } catch {
      setAviso('Erro ao salvar. Verifique se o backend está rodando.')
    } finally {
      setSalvando(false)
    }
  }

  // ── Carregar escalação salva ──────────────────────────────────────────────
  function handleCarregar(esc) {
    const novosSlots = buildSlots(esc.formacao)
    try {
      const assigns = JSON.parse(esc.jogadores_json)
      assigns.forEach(({ idx, jogador_id }) => {
        const jog = jogadores.find(j => j.id === jogador_id)
        if (jog && novosSlots[idx]) novosSlots[idx].jogador = jog
      })
    } catch { /* json parse error: just load empty slots */ }
    setFormacao(esc.formacao)
    setSlots(novosSlots)
    setNomeSalvar(esc.nome)
    setAviso('')
  }

  // ── Deletar escalação salva ───────────────────────────────────────────────
  async function handleDeletar(id) {
    await fetch(`${API}/escalacoes/${id}`, { method: 'DELETE' })
    setEscalacoes(prev => prev.filter(e => e.id !== id))
  }

  // ── Jogadores disponíveis (não estão em nenhum slot) ─────────────────────
  const jogadoresNosSlots = new Set(slots.filter(s => s.jogador).map(s => s.jogador.id))

  // Jogadores disponíveis filtrados pela posição do slot no modal
  const jogadoresParaModal = modalSlotIdx !== null
    ? jogadores.filter(j =>
        !jogadoresNosSlots.has(j.id) ||
        slots[modalSlotIdx]?.jogador?.id === j.id  // o já alocado pode ser trocado
      ).filter(j => {
        // filtro fraco de posição para sugerir a certa (mas não obrigato)
        const slotPos = slots[modalSlotIdx]?.pos
        return !slotPos || j.posicao === slotPos
          || ['GK','DEF','MID','FWD'].every(p => jogadores.filter(jj => !jogadoresNosSlots.has(jj.id) && jj.posicao === p).length === 0)
      })
    : []

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm animate-pulse">Carregando elenco do Brasil…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-6">
        <div>
          <p className="text-gray-400 mb-1">Não foi possível carregar o elenco.</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-10 max-w-6xl mx-auto">

      {/* Cabeçalho */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">🇧🇷</span>
          <h1 className="text-white text-2xl sm:text-3xl font-bold">Escale o Brasil</h1>
        </div>
        <p className="text-gray-500 text-sm">Arraste os jogadores para o campo ou clique para escolher.</p>
      </div>

      {/* Seletor de formação */}
      <div className="flex flex-wrap gap-2 mb-6">
        {LISTA_FORMACOES.map(f => (
          <button
            key={f}
            onClick={() => handleFormacao(f)}
            className={`px-3 py-1.5 text-sm font-bold rounded-lg border transition-colors
              ${formacao === f
                ? 'bg-copa-green border-copa-green text-white'
                : 'bg-copa-card border-copa-border text-gray-400 hover:text-white hover:border-gray-500'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Layout principal: campo + painel */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-4 md:gap-6 md:items-start">

        {/* Campo de futebol */}
        <div className="w-full max-w-sm mx-auto md:max-w-none">
          <CampoFutebol
            slots={slots}
            dragOverSlot={dragOverSlot}
            onDragStart={handleDragStart}
            onDragOver={handleDragOverSlot}
            onDragLeave={handleDragLeave}
            onDrop={handleDropOnSlot}
            onSlotClick={handleSlotClick}
            onSlotRemove={handleSlotRemove}
            onDropOnPanel={handleDropOnPanel}
          />
          {/* Dica */}
          <p className="text-gray-700 text-[10px] text-center mt-2">
            Desktop: arraste · Mobile: toque no slot para escolher · Toque no jogador para remover
          </p>
        </div>

        {/* Painel de jogadores */}
        <div
          className="bg-copa-card border border-copa-border rounded-xl p-4 md:sticky md:top-20"
          style={{ maxHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); handleDropOnPanel() }}
        >
          <h3 className="text-white text-sm font-bold mb-3 shrink-0">Convocados 🇧🇷</h3>
          <PainelJogadores
            jogadores={jogadores}
            jogadoresNosSlots={jogadoresNosSlots}
            filtroPos={filtroPos}
            onFiltroPos={setFiltroPos}
            onDragStart={handleDragStart}
            onClickJogador={handlePainelClick}
          />
        </div>
      </div>

      {/* Seção de salvar */}
      <div className="mt-8 bg-copa-card border border-copa-border rounded-xl p-4">
        <h3 className="text-white text-sm font-bold mb-3">Salvar escalação</h3>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={nomeSalvar}
            onChange={e => setNomeSalvar(e.target.value)}
            placeholder="Nome da escalação"
            maxLength={60}
            className="flex-1 min-w-[180px] bg-copa-dark border border-copa-border rounded-lg
                       px-3 py-2 text-gray-200 text-sm placeholder-gray-600
                       focus:outline-none focus:border-copa-green transition-colors"
          />
          <button
            onClick={handleSalvar}
            disabled={salvando}
            className="bg-copa-green text-white font-bold px-5 py-2 rounded-lg text-sm
                       hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
        {aviso && (
          <p className="text-copa-yellow text-xs mt-2">⚠ {aviso}</p>
        )}
      </div>

      {/* Escalações salvas */}
      <EscalacoesSalvas
        escalacoes={escalacoes}
        onCarregar={handleCarregar}
        onDeletar={handleDeletar}
      />

      {/* Modal mobile */}
      <ModalEscolher
        aberto={modalSlotIdx !== null}
        jogadores={
          modalSlotIdx !== null
            ? jogadores.filter(j => !jogadoresNosSlots.has(j.id) || slots[modalSlotIdx]?.jogador?.id === j.id)
            : []
        }
        onEscolher={handleModalEscolher}
        onFechar={() => setModalSlotIdx(null)}
      />
    </div>
  )
}
