import Flag from '../Flag'

const STATUS_STYLE = {
  agendado:     'bg-gray-700/60 text-gray-300',
  em_andamento: 'bg-green-900/60 text-green-400 animate-pulse',
  encerrado:    'bg-gray-800/60 text-gray-500',
}
const STATUS_LABEL = {
  agendado:     'Agendado',
  em_andamento: 'Ao Vivo',
  encerrado:    'Encerrado',
}

function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full
      ${STATUS_STYLE[status] ?? STATUS_STYLE.agendado}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

function formatFase(jogo) {
  if (jogo.fase === 'grupo') return `Grupo ${jogo.grupo} · Rodada ${jogo.rodada}`
  return {
    oitavas:  'Oitavas de Final',
    quartas:  'Quartas de Final',
    semi:     'Semifinal',
    terceiro: '3º Lugar',
    final:    'Final',
  }[jogo.fase] ?? jogo.fase
}

function formatHorario(dataHora) {
  const timePart = dataHora.replace(' ', 'T').split('T')[1] ?? ''
  const [hour, minute] = timePart.split(':')
  return `${hour}h${minute !== '00' ? minute : ''}`
}

export default function JogoCard({ jogo }) {
  const temPlacar = jogo.gols_a !== null && jogo.gols_b !== null
  const vencedor = temPlacar
    ? jogo.gols_a > jogo.gols_b ? 'a'
    : jogo.gols_b > jogo.gols_a ? 'b'
    : 'empate'
    : null

  const estiloA = vencedor === 'a' ? 'text-copa-green font-bold' : vencedor === 'b' ? 'text-gray-600' : 'text-gray-300'
  const estiloB = vencedor === 'b' ? 'text-copa-green font-bold' : vencedor === 'a' ? 'text-gray-600' : 'text-gray-300'

  return (
    <div className="bg-copa-card border border-copa-border rounded-xl p-4 hover:border-gray-600 transition-colors">

      {/* Linha de topo: fase + horário + status */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-copa-green text-xs font-medium truncate">
          {formatFase(jogo)}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-gray-500 text-xs">{formatHorario(jogo.data_hora)}</span>
          <StatusBadge status={jogo.status} />
        </div>
      </div>

      {/* Confronto: A  |  placar  |  B */}
      <div className="flex items-center gap-3">

        {/* Seleção A — alinhada à direita */}
        <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
          <span className={`text-sm font-semibold text-right leading-tight truncate ${estiloA}`}>
            {jogo.selecao_a_nome}
          </span>
          <Flag emoji={jogo.selecao_a_bandeira} size="text-2xl" className="shrink-0 leading-none" />
        </div>

        {/* Placar ou VS */}
        <div className="shrink-0 w-20 flex flex-col items-center gap-0.5">
          {temPlacar ? (
            <span className="text-copa-yellow font-black text-xl tabular-nums leading-none">
              {jogo.gols_a} – {jogo.gols_b}
            </span>
          ) : (
            <span className="text-gray-600 text-sm font-bold">VS</span>
          )}
          {jogo.penaltis_a !== null && jogo.penaltis_b !== null && (
            <span className="text-gray-600 text-[10px]">
              ({jogo.penaltis_a} – {jogo.penaltis_b} pen.)
            </span>
          )}
        </div>

        {/* Seleção B — alinhada à esquerda */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Flag emoji={jogo.selecao_b_bandeira} size="text-2xl" className="shrink-0 leading-none" />
          <span className={`text-sm font-semibold leading-tight truncate ${estiloB}`}>
            {jogo.selecao_b_nome}
          </span>
        </div>
      </div>

      {/* Rodapé: estádio · cidade */}
      <p className="text-gray-600 text-xs text-center mt-3 truncate">
        {jogo.estadio} · {jogo.cidade}
      </p>
    </div>
  )
}
