import { useState, useEffect, useRef } from 'react'

const STATS = [
  { valor: 48,  label: 'Seleções',      icone: '🌍' },
  { valor: 104, label: 'Jogos',         icone: '⚽' },
  { valor: 16,  label: 'Cidades-sede',  icone: '🏙️' },
  { valor: 3,   label: 'Países-sede',   icone: '🏟️' },
]

// Duração total da animação em ms e quantidade de steps
const DURACAO = 1400
const STEPS   = 50

function useCountUp(alvo, ativo) {
  const [contador, setContador] = useState(0)

  useEffect(() => {
    if (!ativo) return

    let step = 0
    const incremento = alvo / STEPS
    const intervalo  = DURACAO / STEPS

    const timer = setInterval(() => {
      step++
      if (step >= STEPS) {
        setContador(alvo)
        clearInterval(timer)
      } else {
        // Easing: começa rápido e desacelera no final
        const progresso = step / STEPS
        const eased     = 1 - Math.pow(1 - progresso, 3)
        setContador(Math.round(eased * alvo))
      }
    }, intervalo)

    return () => clearInterval(timer)
  }, [ativo, alvo])

  return contador
}

function StatCard({ valor, label, icone, ativo }) {
  const contador = useCountUp(valor, ativo)

  return (
    <div className="bg-copa-card border border-copa-border rounded-xl p-6 flex flex-col items-center gap-2 hover:border-gray-600 transition-colors">
      <span className="text-3xl">{icone}</span>
      <span className="text-copa-yellow font-black tabular-nums leading-none"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
        {contador}
      </span>
      <span className="text-gray-400 text-sm font-medium text-center">{label}</span>
    </div>
  )
}

export default function StatsSection() {
  const [ativo, setAtivo]   = useState(false)
  const sectionRef          = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAtivo(true)
          // Uma vez disparada a animação, não precisa mais observar
          observer.disconnect()
        }
      },
      // threshold: 0.25 = pelo menos 25% da seção precisa estar visível
      { threshold: 0.25 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="px-6 py-12 max-w-6xl mx-auto w-full">
      <h2 className="text-white text-2xl font-bold mb-2">Copa do Mundo 2026</h2>
      <p className="text-gray-500 text-sm mb-8">A maior Copa da história em números</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} ativo={ativo} />
        ))}
      </div>
    </section>
  )
}
