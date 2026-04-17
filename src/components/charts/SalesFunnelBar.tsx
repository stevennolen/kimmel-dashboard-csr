import type { TeamStats } from '../../types'

interface Props { teamStats: TeamStats }

const STAGES = [
  { key: 'qualifiedLeads' as keyof TeamStats, label: 'Qualified',       color: '#FFCC00', icon: '✅' },
  { key: 'contacted'      as keyof TeamStats, label: 'Contacted',       color: '#60a5fa', icon: '📞' },
  { key: 'appointmentSet' as keyof TeamStats, label: 'Appointment Set', color: '#a78bfa', icon: '📅' },
  { key: 'proposalSent'   as keyof TeamStats, label: 'Proposal Sent',   color: '#818cf8', icon: '📋' },
  { key: 'closedWon'      as keyof TeamStats, label: 'Closed Won',      color: '#34d399', icon: '🏆' },
  { key: 'closedLost'     as keyof TeamStats, label: 'Closed Lost',     color: '#f87171', icon: '❌' },
] as const

export default function SalesFunnelBar({ teamStats }: Props) {
  const maxVal = Math.max(
    ...(STAGES.filter(s => s.key !== 'closedLost').map(s => teamStats[s.key] as number)),
    1,
  )
  const isEmpty = STAGES.every(s => (teamStats[s.key] as number) === 0)

  return (
    <div className="card p-5">
      <div className="mb-5">
        <h3 className="font-black text-white">Sales Funnel</h3>
        <p className="text-xs text-gray-600 mt-0.5">Pipeline stages from qualified through close</p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[180px] text-center">
          <p className="text-3xl mb-2">🔽</p>
          <p className="text-gray-600 text-sm">No pipeline data yet</p>
          <p className="text-gray-700 text-xs mt-1">Add leads and update their sales stage</p>
        </div>
      ) : (
        <>
          <div className="space-y-2.5">
            {STAGES.map(stage => {
              const value = teamStats[stage.key] as number
              const pct = stage.key === 'closedLost'
                ? (value / Math.max(teamStats.qualifiedLeads, 1)) * 100
                : (value / maxVal) * 100
              return (
                <div key={stage.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{stage.icon}</span>
                      <span className="text-xs font-medium text-gray-400">{stage.label}</span>
                    </div>
                    <span className="text-sm font-black tabular-nums" style={{ color: stage.color }}>{value}</span>
                  </div>
                  <div className="h-5 bg-gray-800 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-700 flex items-center"
                      style={{
                        width: `${Math.max(pct, value > 0 ? 4 : 0)}%`,
                        backgroundColor: stage.color,
                        opacity: stage.key === 'closedLost' ? 0.5 : 0.8,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          {teamStats.qualifiedLeads > 0 && (
            <div className="flex justify-between text-xs text-gray-700 mt-4 pt-3 border-t border-gray-800">
              <span>Close rate</span>
              <span className="text-emerald-400 font-bold">
                {Math.round((teamStats.closedWon / teamStats.qualifiedLeads) * 100)}%
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
