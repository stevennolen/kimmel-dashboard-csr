import type { CSRStats, Settings } from '../types'
import { fmt$ } from '../utils/calculations'

interface Props {
  csrStats: CSRStats[]
  settings: Settings
}

function StatusBadge({ s }: { s: CSRStats }) {
  if (s.atGoal)               return <span className="stat-pill bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">🏆 Goal Hit</span>
  if (s.qualifiedLeads >= Math.ceil(s.atGoal ? 0 : (s.closedWon > 0 ? 3 : 0)) || s.qualifiedLeads >= 3)
                               return <span className="stat-pill bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30">📈 On Track</span>
  if (s.qualifiedLeads >= 1)  return <span className="stat-pill bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30">⚡ In Progress</span>
  return <span className="stat-pill bg-gray-800 text-gray-600">— Not Started</span>
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: 'yellow' | 'green' | 'red' }) {
  return (
    <div className="bg-gray-800/70 rounded-xl p-2.5 text-center">
      <p className={`text-lg font-black tabular-nums ${
        accent === 'yellow' ? 'text-kimmel-yellow' :
        accent === 'green'  ? 'text-emerald-400'   :
        accent === 'red'    ? 'text-red-400'        :
        'text-white'
      }`}>{value}</p>
      <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  )
}

function CSRCard({ stats, rank, settings }: { stats: CSRStats; rank: number; settings: Settings }) {
  const rankLabels = ['🥇', '🥈', '🥉']
  return (
    <div className={`card-hover p-5 ${stats.atGoal ? 'border-emerald-500/20' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black flex-shrink-0 text-sm ${
            rank <= 3 && stats.qualifiedLeads > 0 ? 'bg-kimmel-yellow-bg' : 'bg-gray-800'
          }`}>
            {rank <= 3 && stats.qualifiedLeads > 0 ? rankLabels[rank - 1] : `#${rank}`}
          </div>
          <div>
            <p className="font-bold text-white leading-tight">{stats.csrName}</p>
            <p className="text-xs text-gray-500">Route {stats.routeNumber}</p>
          </div>
        </div>
        <StatusBadge s={stats} />
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500">Qualified leads</span>
          <span className={`font-bold tabular-nums ${stats.atGoal ? 'text-emerald-400' : 'text-kimmel-yellow'}`}>
            {stats.qualifiedLeads} / {settings.goalPerCSR}
          </span>
        </div>
        <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${stats.atGoal ? 'bg-emerald-500' : 'bg-kimmel-yellow'}`}
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-1.5 mb-4">
        <Stat label="Total"   value={stats.totalLeads}     />
        <Stat label="Pending" value={stats.pendingLeads}   />
        <Stat label="Won"     value={stats.closedWon}      accent="green" />
        <Stat label="Qual"    value={stats.qualifiedLeads} accent="yellow" />
      </div>

      {/* Payout */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-800">
        {[
          { label: 'Lead Pay',  value: fmt$(stats.leadPayout),  accent: undefined },
          { label: 'Close Pay', value: fmt$(stats.closePayout), accent: 'text-emerald-400' },
          { label: 'Total',     value: fmt$(stats.totalPayout), accent: 'text-kimmel-yellow' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="text-center">
            <p className={`text-sm font-bold tabular-nums ${accent ?? 'text-gray-300'}`}>{value}</p>
            <p className="text-[9px] text-gray-600 uppercase tracking-wider mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CSRLeaderboard({ csrStats, settings }: Props) {
  const sorted = [...csrStats].sort((a, b) =>
    b.qualifiedLeads !== a.qualifiedLeads
      ? b.qualifiedLeads - a.qualifiedLeads
      : b.totalPayout - a.totalPayout,
  )

  const isEmpty = csrStats.every(s => s.qualifiedLeads === 0 && s.totalLeads === 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">CSR Leaderboard</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            All {settings.csrList.length} routes · goal: {settings.goalPerCSR} qualified leads each
          </p>
        </div>
      </div>

      {isEmpty && (
        <div className="card p-10 text-center">
          <p className="text-gray-600 text-4xl mb-3">🏁</p>
          <p className="text-white font-bold mb-1">Leaderboard is ready</p>
          <p className="text-gray-500 text-sm">Rankings will appear as leads are submitted.</p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
        {sorted.map((s, i) => (
          <CSRCard key={s.csrId} stats={s} rank={i + 1} settings={settings} />
        ))}
      </div>

      {/* Payout table */}
      {!isEmpty && (
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Payout Summary — All CSRs
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] text-gray-600 uppercase tracking-wider">
                  <th className="text-left pb-2 font-medium">CSR</th>
                  <th className="text-center pb-2 font-medium">Route</th>
                  <th className="text-center pb-2 font-medium">Qual</th>
                  <th className="text-center pb-2 font-medium">Closes</th>
                  <th className="text-right pb-2 font-medium">Lead Pay</th>
                  <th className="text-right pb-2 font-medium">Close Pay</th>
                  <th className="text-right pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {sorted.map(s => (
                  <tr key={s.csrId} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 font-medium text-white">{s.csrName}</td>
                    <td className="py-2.5 text-center text-gray-500">{s.routeNumber}</td>
                    <td className="py-2.5 text-center font-bold text-kimmel-yellow tabular-nums">{s.qualifiedLeads}</td>
                    <td className="py-2.5 text-center font-bold text-emerald-400 tabular-nums">{s.closedWon}</td>
                    <td className="py-2.5 text-right text-gray-300 tabular-nums">{fmt$(s.leadPayout)}</td>
                    <td className="py-2.5 text-right text-emerald-400 tabular-nums">{fmt$(s.closePayout)}</td>
                    <td className="py-2.5 text-right font-bold text-kimmel-yellow tabular-nums">{fmt$(s.totalPayout)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-700">
                <tr>
                  <td colSpan={4} className="py-3 font-bold text-xs uppercase tracking-wider text-white">Team Total</td>
                  <td className="py-3 text-right font-bold tabular-nums text-gray-300">{fmt$(sorted.reduce((a, s) => a + s.leadPayout, 0))}</td>
                  <td className="py-3 text-right font-bold tabular-nums text-emerald-400">{fmt$(sorted.reduce((a, s) => a + s.closePayout, 0))}</td>
                  <td className="py-3 text-right font-black text-base tabular-nums text-kimmel-yellow">{fmt$(sorted.reduce((a, s) => a + s.totalPayout, 0))}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
