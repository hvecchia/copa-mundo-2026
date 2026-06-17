import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar       from './components/Navbar'
import ScrollToTop  from './components/ScrollToTop'
import { ToastProvider } from './components/Toast'
import HomePage      from './pages/HomePage'
import TabelaPage    from './pages/TabelaPage'
import GruposPage    from './pages/GruposPage'
import ElencoPage    from './pages/ElencoPage'
import EscalacaoPage from './pages/EscalacaoPage'
import BolaoPage     from './pages/BolaoPage'
import AdminPage     from './pages/AdminPage'

function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  return (
    <ToastProvider>
      <ScrollToTop />
      {!isAdmin && <Navbar />}
      <main key={pathname} className={`bg-copa-dark animate-fadeIn ${isAdmin ? '' : 'pt-16'}`}>
        <Routes>
          <Route path="/"        element={<HomePage />}      />
          <Route path="/tabela"  element={<TabelaPage />}    />
          <Route path="/grupos"  element={<GruposPage />}    />
          <Route path="/elencos" element={<ElencoPage />}    />
          <Route path="/brasil"  element={<EscalacaoPage />} />
          <Route path="/bolao"   element={<BolaoPage />}     />
          <Route path="/admin"   element={<AdminPage />}     />
        </Routes>
      </main>
    </ToastProvider>
  )
}

export default App
