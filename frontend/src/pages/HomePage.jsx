import { useEffect } from 'react'
import HeroSection from '../components/HeroSection'
import Countdown from '../components/Countdown'
import ProximosJogos from '../components/ProximosJogos'
import UltimosResultados from '../components/UltimosResultados'
import StatsSection from '../components/StatsSection'

export default function HomePage() {
  useEffect(() => { document.title = 'Copa do Mundo 2026' }, [])
  return (
    <>
      <div id="inicio">      <HeroSection />       </div>
      <Countdown />
      <div id="proximos">   <ProximosJogos />     </div>
      <div id="resultados"> <UltimosResultados />  </div>
      <div id="stats">      <StatsSection />       </div>
    </>
  )
}
