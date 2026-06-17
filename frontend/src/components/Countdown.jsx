import { useState, useEffect } from 'react'

// 11 jun 2026 16h00 BRT (UTC-3) = 19h00 UTC
const OPENING = new Date('2026-06-11T19:00:00Z')
// 19 jul 2026 fim do dia BRT = 20 jul 03h00 UTC
const CLOSING = new Date('2026-07-20T03:00:00Z')

function getState() {
  const now = Date.now()
  if (now < OPENING.getTime()) return 'before'
  if (now <= CLOSING.getTime()) return 'during'
  return 'after'
}

function calcTimeLeft() {
  const diff = OPENING.getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

const UNITS = ['DIAS', 'HORAS', 'MINUTOS', 'SEGUNDOS']

function CountdownCard({ label, value }) {
  return (
    <div className="bg-copa-card border border-copa-border rounded-xl px-6 py-5 flex flex-col items-center gap-2 min-w-[90px]">
      <span className="text-copa-yellow text-5xl font-bold tabular-nums">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-gray-500 text-xs tracking-widest">{label}</span>
    </div>
  )
}

function StateDuring() {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <span className="text-4xl animate-bounce">⚽</span>
      <p className="text-copa-yellow text-3xl font-bold">A Copa está rolando!</p>
      <p className="text-gray-500 text-sm">11 jun – 19 jul 2026</p>
    </div>
  )
}

function StateAfter() {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <span className="text-4xl">🏆</span>
      <p className="text-gray-300 text-3xl font-bold">A Copa 2026 acabou</p>
      <p className="text-gray-500 text-sm">Até a próxima!</p>
    </div>
  )
}

export default function Countdown() {
  // lazy initializers — evita recalcular no primeiro render
  const [phase, setPhase] = useState(getState)
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft)

  useEffect(() => {
    if (phase !== 'before') return

    const id = setInterval(() => {
      const next = getState()
      if (next !== 'before') {
        setPhase(next)
        return
      }
      setTimeLeft(calcTimeLeft())
    }, 1000)

    return () => clearInterval(id)
  }, [phase])

  if (phase === 'during') return <StateDuring />
  if (phase === 'after')  return <StateAfter />

  // fase 'before'
  const values = [
    timeLeft?.days    ?? 0,
    timeLeft?.hours   ?? 0,
    timeLeft?.minutes ?? 0,
    timeLeft?.seconds ?? 0,
  ]

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <p className="text-gray-400 text-sm uppercase tracking-widest">
        Faltam para a abertura
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {UNITS.map((label, i) => (
          <CountdownCard key={label} label={label} value={values[i]} />
        ))}
      </div>
      <p className="text-gray-600 text-xs">
        11 jun 2026 · 16h (Brasília) · Estádio Azteca
      </p>
    </div>
  )
}
