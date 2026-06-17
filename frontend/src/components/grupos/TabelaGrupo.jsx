import Flag from '../Flag'

// Indicadores visuais de classificação por posição
const POS = {
  borda: (pos) =>
    pos <= 2 ? 'border-l-2 border-copa-green'
    : pos === 3 ? 'border-l-2 border-copa-yellow'
    : 'border-l-2 border-transparent',
  bg: (pos) =>
    pos <= 2 ? 'bg-green-900/10'
    : pos === 3 ? 'bg-yellow-900/10'
    : '',
  num: (pos) =>
    pos <= 2 ? 'text-copa-green'
    : pos === 3 ? 'text-copa-yellow'
    : 'text-gray-600',
}

// Linha compacta para cada jogo do grupo
function JogoRow({ jogo }) {
  const temPlacar = jogo.gols_a !== null && jogo.gols_b !== null
  return (
    <div className="flex items-center gap-1 py-2 px-3 border-b border-copa-border/40 last:border-0 text-xs">
      <span className="text-gray-700 w-4 text-center shrink-0 tabular-nums">{jogo.rodada}</span>
      <span className="flex-1 text-right text-gray-400 truncate min-w-0 leading-tight">
        {jogo.selecao_a_nome}
      </span>
      <Flag emoji={jogo.selecao_a_bandeira} size="text-base" className="mx-0.5 shrink-0" />
      <span className={`w-9 text-center font-bold tabular-nums shrink-0
        ${temPlacar ? 'text-copa-yellow' : 'text-gray-700'}`}>
        {temPlacar ? `${jogo.gols_a}–${jogo.gols_b}` : '–'}
      </span>
      <Flag emoji={jogo.selecao_b_bandeira} size="text-base" className="mx-0.5 shrink-0" />
      <span className="flex-1 text-left text-gray-400 truncate min-w-0 leading-tight">
        {jogo.selecao_b_nome}
      </span>
    </div>
  )
}

export default function TabelaGrupo({ grupo, classificacao, jogos }) {
  const jogaram = classificacao.filter(s => s.J > 0).length

  return (
    <div className="bg-copa-card border border-copa-border rounded-xl overflow-hidden">

      {/* Cabeçalho do card */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-copa-border">
        <h2 className="text-white font-bold text-sm tracking-wide">Grupo {grupo}</h2>
        {jogaram > 0 && (
          <span className="text-gray-600 text-xs">{jogaram}/{classificacao.length} jogaram</span>
        )}
      </div>

      {/* Tabela de classificação */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-copa-border/50 text-gray-600">
              <th className="text-left py-2 pl-3 pr-1 w-5">#</th>
              <th className="text-left py-2 px-2">Seleção</th>
              <th className="text-center py-2 px-1.5 w-6">J</th>
              <th className="text-center py-2 px-1.5 w-6 hidden sm:table-cell">V</th>
              <th className="text-center py-2 px-1.5 w-6 hidden sm:table-cell">E</th>
              <th className="text-center py-2 px-1.5 w-6 hidden sm:table-cell">D</th>
              <th className="text-center py-2 px-1.5 w-7 hidden md:table-cell">GP</th>
              <th className="text-center py-2 px-1.5 w-7 hidden md:table-cell">GC</th>
              <th className="text-center py-2 px-1.5 w-8">SG</th>
              <th className="text-center py-2 pl-1.5 pr-3 w-8 text-gray-400 font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {classificacao.map((sel) => (
              <tr
                key={sel.selecao_id}
                className={`border-b border-copa-border/20 last:border-0 ${POS.bg(sel.posicao)}`}
              >
                {/* Posição + indicador de cor na borda esquerda */}
                <td className={`py-2.5 pl-2 pr-1 ${POS.borda(sel.posicao)}`}>
                  <span className={`font-semibold ${POS.num(sel.posicao)}`}>{sel.posicao}</span>
                </td>

                {/* Seleção: bandeira + nome + badge CH */}
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Flag emoji={sel.bandeira_emoji} size="text-base" className="shrink-0" />
                    <span className="text-gray-200 truncate">{sel.nome_pt}</span>
                    {sel.eh_cabeca_chave && (
                      <span className="hidden sm:inline-block text-[9px] text-copa-gold border border-copa-gold/40 px-1 py-px rounded shrink-0">
                        CH
                      </span>
                    )}
                  </div>
                </td>

                <td className="text-center py-2.5 px-1.5 text-gray-400 tabular-nums">{sel.J}</td>
                <td className="text-center py-2.5 px-1.5 text-gray-400 tabular-nums hidden sm:table-cell">{sel.V}</td>
                <td className="text-center py-2.5 px-1.5 text-gray-400 tabular-nums hidden sm:table-cell">{sel.E}</td>
                <td className="text-center py-2.5 px-1.5 text-gray-400 tabular-nums hidden sm:table-cell">{sel.D}</td>
                <td className="text-center py-2.5 px-1.5 text-gray-400 tabular-nums hidden md:table-cell">{sel.GP}</td>
                <td className="text-center py-2.5 px-1.5 text-gray-400 tabular-nums hidden md:table-cell">{sel.GC}</td>

                {/* Saldo — verde se positivo, vermelho se negativo */}
                <td className={`text-center py-2.5 px-1.5 tabular-nums
                  ${sel.SG > 0 ? 'text-green-400' : sel.SG < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                  {sel.SG > 0 ? `+${sel.SG}` : sel.SG}
                </td>

                <td className="text-center py-2.5 pl-1.5 pr-3 text-white font-bold tabular-nums">
                  {sel.Pts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda de classificação */}
      <div className="flex gap-4 px-3 py-2 border-t border-copa-border/30">
        <span className="flex items-center gap-1 text-[10px] text-gray-600">
          <span className="inline-block w-2 h-2 rounded-sm bg-copa-green/70" />
          Oitavas
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-600">
          <span className="inline-block w-2 h-2 rounded-sm bg-copa-yellow/70" />
          Possível melhor 3º
        </span>
      </div>

      {/* Jogos do grupo */}
      <div className="border-t border-copa-border/50">
        <p className="px-3 pt-2.5 pb-1 text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
          Jogos
        </p>
        {jogos.map(jogo => (
          <JogoRow key={jogo.id} jogo={jogo} />
        ))}
      </div>
    </div>
  )
}
