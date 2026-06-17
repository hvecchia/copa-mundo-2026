const FASES = [
  { value: '',         label: 'Todas as fases' },
  { value: 'grupo',   label: 'Fase de Grupos' },
  { value: 'oitavas', label: 'Oitavas de Final' },
  { value: 'quartas', label: 'Quartas de Final' },
  { value: 'semi',    label: 'Semifinal' },
  { value: 'terceiro',label: '3º Lugar' },
  { value: 'final',   label: 'Final' },
]

const GRUPOS = 'ABCDEFGHIJKL'.split('')

const STATUS_TABS = [
  { value: '',            label: 'Todos' },
  { value: 'agendado',    label: 'Agendados' },
  { value: 'em_andamento',label: 'Ao Vivo' },
  { value: 'encerrado',   label: 'Encerrados' },
]

const SELECT_CLASS =
  'bg-copa-card border border-copa-border text-gray-300 text-sm rounded-lg px-3 py-2 ' +
  'focus:outline-none focus:border-copa-green cursor-pointer transition-colors'

export default function FiltrosJogos({ filtros, onChange }) {
  const temFiltroAtivo = filtros.status || filtros.fase || filtros.grupo

  return (
    <div className="flex flex-wrap gap-3 mb-8">

      {/* Tabs de status */}
      <div className="flex gap-1 bg-copa-card border border-copa-border rounded-lg p-1">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange({ ...filtros, status: value })}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
              ${filtros.status === value
                ? 'bg-copa-green text-white'
                : 'text-gray-400 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Select de fase */}
      <select
        value={filtros.fase}
        onChange={e => onChange({ ...filtros, fase: e.target.value })}
        className={SELECT_CLASS}
      >
        {FASES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {/* Select de grupo — só relevante na fase de grupos */}
      <select
        value={filtros.grupo}
        onChange={e => onChange({ ...filtros, grupo: e.target.value })}
        className={SELECT_CLASS}
        disabled={filtros.fase !== '' && filtros.fase !== 'grupo'}
      >
        <option value="">Todos os grupos</option>
        {GRUPOS.map(g => (
          <option key={g} value={g}>Grupo {g}</option>
        ))}
      </select>

      {/* Limpar filtros */}
      {temFiltroAtivo && (
        <button
          onClick={() => onChange({ status: '', fase: '', grupo: '' })}
          className="text-gray-500 hover:text-white text-sm px-3 py-2 transition-colors underline underline-offset-2"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
