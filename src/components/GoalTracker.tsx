import type { CSRStats, Settings } from '../types'

interface Props { csrStats: CSRStats[]; settings: Settings }

export default function GoalTracker({ csrStats, settings }: Props) {
  const atGoal  = csrStats.filter(s => s.atGoal)
  const onTrack = csrStats.filter(s => !s.atGoal && s.qualifiedLeads >= 3)
  const started = csrStats.filter(s => s.qualifiedLeads > 0 && s.qualifiedLeads < 3)
  const notYet  = csrStats.filter(s => s.qualifiedLeads === 0)

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-white">Goal Tracker</h3>
          <p className="text-xs text-gray-600 mt-0.5">{settings.goalPerCSR} qualified leads = goal</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black ${atGoal.length > 0 ? 'text-kimmel-yellow' : 'text-gray-700'}`}>
            {atGoal.length}
          </p>
          <p className="text-[10px] text-gray-600 uppercase tracking-wider">at goal</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs mb-1.5 text-gray-600">
          <span>CSRs at goal</span>
          <span className={`font-bold ${atGoal.length > 0 ? 'text-kimmel-yellow' : 'text-gray-700'}`}>
            {atGoal.length} / {settings.csrList.length}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-kimmel-yellow rounded-full transition-all duration-700"
            style={{ width: `${csrStats.length > 0 ? (atGoal.length / csrStats.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {atGoal.length > 0 && <Group label="🏆 Goal Hit" routes={atGoal} color="text-emerald-400" bg="bg-emerald-500/10" goal={settings.goalPerCSR} />}
        {onTrack.length > 0 && <Group label="📈 On Track" routes={onTrack} color="text-blue-400" bg="bg-blue-500/10" goal={settings.goalPerCSR} />}
        {started.length > 0 && <Group label="⚡ In Progress" routes={started} color="text-amber-400" bg="bg-amber-500/10" goal={settings.goalPerCSR} />}
        {notYet.length > 0  && <Group label="— Not Started" routes={notYet} color="text-gray-600" bg="bg-gray-800" goal={settings.goalPerCSR} />}
        {csrStats.length === 0 && (
          <p className="text-gray-700 text-sm text-center py-4">No CSRs configured.</p>
        )}
      </div>
    </div>
  )
}

function Group({ label, routes, color, bg, goal }: {
  label: string; routes: CSRStats[]; color: string; bg: string; goal: number
}) {
  return (
    <div>
      <p className="text-[10px] text-gray-700 uppercase tracking-wider mb-2 font-semibold">{label}</p>
      <div className="space-y-1.5">
        {routes.map(r => (
          <div key={r.csrId} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`stat-pill flex-shrink-0 ${bg} ${color}`}>Rt {r.routeNumber}</span>
              <span className="text-xs text-gray-500 truncate">{r.csrName}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="w-14 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${r.atGoal ? 'bg-emerald-500' : 'bg-kimmel-yellow'}`}
                  style={{ width: `${r.progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-400 tabular-nums w-8 text-right">
                {r.qualifiedLeads}/{goal}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
