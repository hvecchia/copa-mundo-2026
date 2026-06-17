import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'

const NAVBAR_H = 64 // px — altura da barra (h-16)

// Links que fazem scroll em seções da Home
const SECAO_LINKS = [
  { label: 'Início',         id: 'inicio'     },
  { label: 'Próximos Jogos', id: 'proximos'   },
  { label: 'Resultados',     id: 'resultados' },
  { label: 'Stats',          id: 'stats'      },
]

function scrollParaSecao(id) {
  const el = document.getElementById(id)
  if (!el) return
  const topo = el.getBoundingClientRect().top + window.scrollY - NAVBAR_H
  window.scrollTo({ top: topo, behavior: 'smooth' })
}

function HamburguerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6"  x2="19" y2="6"  />
      <line x1="3" y1="11" x2="19" y2="11" />
      <line x1="3" y1="16" x2="19" y2="16" />
    </svg>
  )
}

function FecharIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="4"  x2="18" y2="18" />
      <line x1="18" y1="4" x2="4"  y2="18" />
    </svg>
  )
}

// Ponto indicador abaixo do link ativo
function DotIndicator({ visivel }) {
  return (
    <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-copa-green
      transition-opacity duration-200 ${visivel ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}

export default function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [secaoAtiva, setSecaoAtiva] = useState('inicio')
  const location = useLocation()
  const navigate  = useNavigate()
  const isHome    = location.pathname === '/'

  // Fecha o menu ao redimensionar para desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuAberto(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Detecta seção ativa — apenas na home
  // rootMargin cria uma "faixa" no centro do viewport: só dispara quando
  // a seção cruza essa linha central, evitando ambiguidade entre seções adjacentes
  useEffect(() => {
    if (!isHome) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setSecaoAtiva(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -55% 0px', threshold: 0 },
    )

    SECAO_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [isHome])

  function handleSecaoLink(id) {
    if (isHome) {
      scrollParaSecao(id)
    } else {
      // Em outras páginas, volta para a home — o usuário rola manualmente
      navigate('/')
    }
    setMenuAberto(false)
  }

  // Classes compartilhadas para o link de página (NavLink)
  const navLinkClass = ({ isActive }) =>
    `relative px-4 py-2 text-sm font-medium rounded-lg transition-colors
     ${isActive ? 'text-copa-green' : 'text-gray-400 hover:text-white'}`

  const navLinkClassMobile = ({ isActive }) =>
    `text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors
     ${isActive
       ? 'text-copa-green bg-copa-card border border-copa-border'
       : 'text-gray-400 hover:text-white hover:bg-copa-card'}`

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b border-copa-border"
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.85)' }}
    >
      {/* Barra principal */}
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => handleSecaoLink('inicio')}
          className="font-black text-xl text-white tracking-tight hover:opacity-80 transition-opacity"
        >
          Copa <span className="text-copa-yellow">2026</span>
        </button>

        {/* Links — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {SECAO_LINKS.map(({ label, id }) => {
            const ativo = isHome && secaoAtiva === id
            return (
              <button
                key={id}
                onClick={() => handleSecaoLink(id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${ativo ? 'text-copa-green' : 'text-gray-400 hover:text-white'}`}
              >
                {label}
                <DotIndicator visivel={ativo} />
              </button>
            )
          })}

          {/* Separador */}
          <span className="w-px h-4 bg-copa-border mx-1" />

          {/* Links de páginas — NavLink para active state automático */}
          <NavLink to="/grupos" className={navLinkClass}>
            {({ isActive }) => (<>Grupos<DotIndicator visivel={isActive} /></>)}
          </NavLink>
          <NavLink to="/elencos" className={navLinkClass}>
            {({ isActive }) => (<>Elencos<DotIndicator visivel={isActive} /></>)}
          </NavLink>
          <NavLink to="/tabela" className={navLinkClass}>
            {({ isActive }) => (<>Tabela<DotIndicator visivel={isActive} /></>)}
          </NavLink>
          <NavLink to="/brasil" className={navLinkClass}>
            {({ isActive }) => (<>🇧🇷 Brasil<DotIndicator visivel={isActive} /></>)}
          </NavLink>
          <NavLink to="/bolao" className={navLinkClass}>
            {({ isActive }) => (<>Bolão<DotIndicator visivel={isActive} /></>)}
          </NavLink>
        </nav>

        {/* Botão hambúrguer — mobile */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          onClick={() => setMenuAberto(v => !v)}
          aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuAberto}
        >
          {menuAberto ? <FecharIcon /> : <HamburguerIcon />}
        </button>
      </div>

      {/* Menu mobile */}
      {menuAberto && (
        <div
          className="md:hidden border-t border-copa-border px-4 py-3 flex flex-col gap-1"
          style={{ backgroundColor: 'rgba(10, 10, 10, 0.97)' }}
        >
          {SECAO_LINKS.map(({ label, id }) => {
            const ativo = isHome && secaoAtiva === id
            return (
              <button
                key={id}
                onClick={() => handleSecaoLink(id)}
                className={`text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${ativo
                    ? 'text-copa-green bg-copa-card border border-copa-border'
                    : 'text-gray-400 hover:text-white hover:bg-copa-card'}`}
              >
                {label}
              </button>
            )
          })}
          <NavLink to="/grupos"  className={navLinkClassMobile} onClick={() => setMenuAberto(false)}>Grupos</NavLink>
          <NavLink to="/elencos" className={navLinkClassMobile} onClick={() => setMenuAberto(false)}>Elencos</NavLink>
          <NavLink to="/tabela"  className={navLinkClassMobile} onClick={() => setMenuAberto(false)}>Tabela</NavLink>
          <NavLink to="/brasil"  className={navLinkClassMobile} onClick={() => setMenuAberto(false)}>🇧🇷 Brasil</NavLink>
          <NavLink to="/bolao"   className={navLinkClassMobile} onClick={() => setMenuAberto(false)}>Bolão</NavLink>
        </div>
      )}
    </header>
  )
}
