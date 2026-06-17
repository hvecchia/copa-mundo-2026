import { useState, useEffect } from 'react'
import Flag from '../components/Flag'
import { useToast } from '../components/Toast'

const API = 'http://localhost:8000/api'
const SESSION_KEY = 'copa_admin_key'

const STATUS_PT = {
  agendado:     'Agendado',
  em_andamento: 'Em Andamento',
  encerrado:    'Encerrado',
}

const STATUS_CORES = {
  agendado:     'text-gray-400',
  em_andamento: 'text-copa-green animate-pulse',
  encerrado:    'text-gray-600',
}

// ── Utilitários ───────────────────────────────────────────────────────────────

function formatDataHora(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    timeZone:  'America/Sao_Paulo',
    day:       '2-digit',
    month:     '2-digit',
    hour:      '2-digit',
    minute:    '2-digit',
  })
}

function dataStr(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday:  'short',
    day:      '2-digit',
    month:    '2-digit',
  })
}

// ── Linha editável de um jogo ─────────────────────────────────────────────────
function JogoRow({ jogo, adminKey }) {
  const toast = useToast()
  const [gols_a,    setGolsA]    = useState(jogo.gols_a ?? '')
  const [gols_b,    setGolsB]    = useState(jogo.gols_b ?? '')
  const [status,    setStatus]   = useState(jogo.status)
  const [saveState, setSaveState] = useState(null)

  const dirty =
    String(gols_a) !== String(jogo.gols_a ?? '') ||
    String(gols_b) !== String(jogo.gols_b ?? '') ||
    status !== jogo.status

  async function salvar() {
    setSaveState('saving')
    try {
      const body = { status }
      if (gols_a !== '') body.gols_a = Number(gols_a)
      if (gols_b !== '') body.gols_b = Number(gols_b)

      const r = await fetch(`${API}/admin/jogos/${jogo.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
        body:    JSON.stringify(body),
      })

      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err.detail || `HTTP ${r.status}`)
      }

      setSaveState('saved')
      toast('Placar salvo com sucesso', 'success')
      setTimeout(() => setSaveState(null), 2500)
    } catch (e) {
      setSaveState('error')
      toast(`Erro ao salvar: ${e.message}`, 'error')
    }
  }

  function numInput(val, setter) {
    return (
      <input
        type="text"
        inputMode="numeric"
        value={val}
        onChange={e => {
          const v = e.target.value.replace(/\D/, '')
          setter(v === '' ? '' : String(Math.min(20, Number(v))))
        }}
        className="w-9 text-center bg-copa-dark border border-copa-border rounded
                   text-white font-mono text-sm font-bold py-1
                   focus:outline-none focus:border-copa-green transition-colors"
      />
    )
  }

  return (
    <div className={`grid items-center gap-2 py-2 px-3 rounded-lg transition-colors
      ${dirty ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'}`}
      style={{ gridTemplateColumns: '80px 1fr auto auto auto auto 90px 70px' }}
    >
      {/* Hora */}
      <span className="text-gray-600 text-[11px] tabular-nums">
        {formatDataHora(jogo.data_hora).split(',')[1]?.trim() || '—'}
      </span>

      {/* Times */}
      <div className="flex items-center gap-1.5 min-w-0">
        <Flag emoji={jogo.selecao_a_bandeira} size="text-base" />
        <span className="text-gray-200 text-xs truncate">{jogo.selecao_a_nome || '—'}</span>
        <span className="text-gray-600 text-xs mx-0.5">vs</span>
        <span className="text-gray-200 text-xs truncate">{jogo.selecao_b_nome || '—'}</span>
        <Flag emoji={jogo.selecao_b_bandeira} size="text-base" />
      </div>

      {/* Placar */}
      {numInput(gols_a, setGolsA)}
      <span className="text-gray-600 text-sm text-center">×</span>
      {numInput(gols_b, setGolsB)}

      {/* Grupo / fase */}
      <span className="text-gray-600 text-[10px] uppercase tracking-wide text-center">
        {jogo.grupo ? `G-${jogo.grupo}` : jogo.fase}
      </span>

      {/* Status */}
      <select
        value={status}
        onChange={e => setStatus(e.target.value)}
        className="bg-copa-dark border border-copa-border rounded text-xs text-gray-300 py-1 px-1.5
                   focus:outline-none focus:border-copa-green cursor-pointer"
      >
        <option value="agendado">Agendado</option>
        <option value="em_andamento">Em Andamento</option>
        <option value="encerrado">Encerrado</option>
      </select>

      {/* Botão salvar + indicador de estado */}
      <div className="flex items-center gap-1 justify-end">
        {saveState === 'saving' && (
          <span className="text-gray-500 text-[10px] animate-pulse">●</span>
        )}
        {saveState === 'saved' && (
          <span className="text-copa-green text-[10px]">✓</span>
        )}
        {saveState === 'error' && (
          <span className="text-red-400 text-[10px]">✕</span>
        )}
        <button
          onClick={salvar}
          disabled={!dirty || saveState === 'saving'}
          className={`px-2.5 py-1 rounded text-xs font-bold transition-colors
            ${dirty && saveState !== 'saving'
              ? 'bg-copa-green text-white hover:bg-green-700'
              : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
        >
          Salvar
        </button>
      </div>
    </div>
  )
}

// ── Tela de login ─────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [senha,   setSenha]   = useState('')
  const [erro,    setErro]    = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!senha.trim()) return
    setLoading(true)
    setErro(null)
    try {
      const r = await fetch(`${API}/admin/verificar`, {
        headers: { 'X-Admin-Key': senha.trim() },
      })
      if (r.ok) {
        onLogin(senha.trim())
      } else {
        setErro('Senha incorreta.')
      }
    } catch {
      setErro('Erro ao conectar com o servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">🔐</p>
          <h1 className="text-white text-2xl font-bold">Painel Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Copa do Mundo 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-copa-card border border-copa-border rounded-xl p-6">
          <label className="block text-gray-400 text-sm font-medium mb-2">
            Senha de administrador
          </label>
          <input
            type="password"
            autoFocus
            value={senha}
            onChange={e => { setSenha(e.target.value); setErro(null) }}
            placeholder="Digite a senha…"
            className="w-full bg-copa-dark border border-copa-border rounded-lg px-3 py-2.5
                       text-white placeholder-gray-600 text-sm
                       focus:outline-none focus:border-copa-green transition-colors mb-4"
          />

          {erro && (
            <p className="text-red-400 text-sm mb-3">{erro}</p>
          )}

          <button
            type="submit"
            disabled={loading || !senha.trim()}
            className="w-full bg-copa-green text-white font-bold py-2.5 rounded-lg text-sm
                       hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verificando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-gray-700 text-xs text-center mt-4">
          Acesso restrito — não compartilhe esta URL.
        </p>
      </div>
    </div>
  )
}

// ── Painel principal ──────────────────────────────────────────────────────────
function Painel({ adminKey, onLogout }) {
  const [jogos,        setJogos]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [erro,         setErro]         = useState(null)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [busca,        setBusca]        = useState('')

  useEffect(() => { fetchJogos() }, []) // eslint-disable-line

  async function fetchJogos() {
    setLoading(true)
    setErro(null)
    try {
      const r = await fetch(`${API}/jogos`)
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setJogos(Array.isArray(data) ? data : [])
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Filtragem
  const jogosFiltrados = jogos.filter(j => {
    if (filtroStatus !== 'todos' && j.status !== filtroStatus) return false
    if (busca.trim()) {
      const b = busca.toLowerCase()
      const campos = [j.selecao_a_nome, j.selecao_b_nome, j.grupo, j.fase, j.cidade]
      return campos.some(c => c?.toLowerCase().includes(b))
    }
    return true
  })

  // Agrupamento por data
  const porData = jogosFiltrados.reduce((acc, j) => {
    const d = dataStr(j.data_hora) || 'Sem data'
    if (!acc[d]) acc[d] = []
    acc[d].push(j)
    return acc
  }, {})

  const contadores = {
    todos:        jogos.length,
    agendado:     jogos.filter(j => j.status === 'agendado').length,
    em_andamento: jogos.filter(j => j.status === 'em_andamento').length,
    encerrado:    jogos.filter(j => j.status === 'encerrado').length,
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 max-w-5xl mx-auto">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">Painel Admin</h1>
          <p className="text-gray-600 text-xs mt-0.5">Copa do Mundo 2026 — atualização de placares</p>
        </div>
        <button
          onClick={onLogout}
          className="text-gray-600 text-xs hover:text-gray-300 transition-colors"
        >
          Sair →
        </button>
      </div>

      {/* Filtros de status */}
      <div className="flex flex-wrap gap-1 mb-4">
        {[
          ['todos',        'Todos',        contadores.todos],
          ['agendado',     'Agendados',    contadores.agendado],
          ['em_andamento', 'Ao Vivo',      contadores.em_andamento],
          ['encerrado',    'Encerrados',   contadores.encerrado],
        ].map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setFiltroStatus(val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border
              ${filtroStatus === val
                ? 'bg-copa-green border-copa-green text-white'
                : 'bg-copa-card border-copa-border text-gray-400 hover:text-white'}`}
          >
            {label}
            <span className={`ml-1.5 ${filtroStatus === val ? 'text-green-200' : 'text-gray-600'}`}>
              {count}
            </span>
          </button>
        ))}

        {/* Busca */}
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar seleção, grupo…"
          className="ml-auto bg-copa-card border border-copa-border rounded-lg px-3 py-1.5
                     text-gray-300 text-xs placeholder-gray-600
                     focus:outline-none focus:border-copa-green transition-colors w-48"
        />

        {/* Atualizar lista */}
        <button
          onClick={fetchJogos}
          className="text-gray-600 hover:text-copa-green text-xs transition-colors px-2"
          title="Recarregar lista de jogos"
        >
          ↺
        </button>
      </div>

      {/* Cabeçalho da tabela */}
      <div className="hidden sm:grid text-gray-600 text-[10px] uppercase tracking-widest font-semibold
                      gap-2 px-3 pb-1 border-b border-copa-border mb-1"
        style={{ gridTemplateColumns: '80px 1fr auto auto auto auto 90px 70px' }}
      >
        <span>Hora (BRT)</span>
        <span>Confronto</span>
        <span className="text-center">A</span>
        <span />
        <span className="text-center">B</span>
        <span className="text-center">Grupo</span>
        <span>Status</span>
        <span />
      </div>

      {/* Lista de jogos */}
      {loading && (
        <p className="text-gray-500 text-sm text-center py-12 animate-pulse">Carregando jogos…</p>
      )}

      {erro && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">{erro}</p>
          <button onClick={fetchJogos} className="text-copa-green text-sm hover:underline">
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !erro && Object.keys(porData).length === 0 && (
        <p className="text-gray-600 text-sm text-center py-12">Nenhum jogo encontrado.</p>
      )}

      {!loading && !erro && Object.entries(porData).map(([data, lista]) => (
        <div key={data} className="mb-4">
          <p className="text-gray-600 text-[10px] uppercase tracking-widest font-semibold
                        px-3 py-1.5 border-b border-copa-border/50 mb-1">
            {data}
          </p>
          {lista.map(j => (
            <JogoRow key={j.id} jogo={j} adminKey={adminKey} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Página raiz ───────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [adminKey, setAdminKey] = useState(() => sessionStorage.getItem(SESSION_KEY) || '')
  const [autenticado, setAutenticado] = useState(false)

  // Tenta revalidar chave salva na sessão ao montar
  useEffect(() => {
    if (!adminKey) return
    fetch(`${API}/admin/verificar`, { headers: { 'X-Admin-Key': adminKey } })
      .then(r => {
        if (r.ok) setAutenticado(true)
        else {
          sessionStorage.removeItem(SESSION_KEY)
          setAdminKey('')
        }
      })
      .catch(() => {
        sessionStorage.removeItem(SESSION_KEY)
        setAdminKey('')
      })
  }, []) // eslint-disable-line

  function handleLogin(key) {
    sessionStorage.setItem(SESSION_KEY, key)
    setAdminKey(key)
    setAutenticado(true)
  }

  function handleLogout() {
    sessionStorage.removeItem(SESSION_KEY)
    setAdminKey('')
    setAutenticado(false)
  }

  if (!autenticado) return <LoginScreen onLogin={handleLogin} />
  return <Painel adminKey={adminKey} onLogout={handleLogout} />
}
