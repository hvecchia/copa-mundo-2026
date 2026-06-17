export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-copa-dark overflow-hidden flex flex-col items-center justify-center px-6 py-24 text-center">

      {/* Glow verde — canto superior esquerdo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 55% at 15% 15%, #009C3B28 0%, transparent 65%)' }}
      />
      {/* Glow azul — canto inferior direito */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 85% 85%, #00277655 0%, transparent 65%)' }}
      />

      {/* Conteúdo */}
      <div className="relative z-10 flex flex-col items-center gap-5">
        <span className="text-copa-green text-xs sm:text-sm uppercase tracking-[0.5em] font-semibold">
          FIFA World Cup
        </span>

        <h1 className="font-black leading-none tracking-tight">
          <span className="block text-white text-7xl sm:text-[9rem] lg:text-[12rem]">Copa</span>
          <span className="block text-copa-yellow text-7xl sm:text-[9rem] lg:text-[12rem]">2026</span>
        </h1>

        <p className="text-copa-green text-xl sm:text-3xl font-bold tracking-[0.3em] uppercase">
          We Are 26
        </p>

        <p className="text-gray-400 text-sm sm:text-base max-w-xs sm:max-w-md leading-relaxed mt-1">
          Acompanhe jogos em tempo real, monte sua escalação e dispute o bolão com amigos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          <button className="bg-copa-green text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors">
            Ver Jogos
          </button>
          <button className="border border-copa-border text-gray-300 font-bold py-3 px-8 rounded-lg hover:border-copa-green hover:text-copa-green transition-colors">
            Fazer Bolão
          </button>
        </div>
      </div>

      {/* Fade suave para a próxima seção */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-copa-dark to-transparent pointer-events-none" />
    </section>
  )
}
