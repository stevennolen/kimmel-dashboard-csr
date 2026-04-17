import type { TeamStats, Settings } from '../types'
import { fmt$ } from '../utils/calculations'

interface Props {
  stats:         TeamStats
  daysRemaining: number
  settings:      Settings
}

type Accent = 'yellow' | 'green' | 'red' | 'blue' | 'none'

function StatCard({ label, value, sub, accent = 'none', zero = false }: {
  label: string; value: string | number; sub?: string; accent?: Accent; zero?: boolean
}) {
  const val = String(value)
  const isEmpty = val === '0' || val === '$0'
  const valueClass =
    isEmpty && zero ? 'text-gray-700' :
    accent === 'yellow' ? 'text-kimmel-yellow' :
    accent === 'green'  ? 'text-emerald-400'   :
    accent === 'red'    ? 'text-red-400'        :
    accent === 'blue'   ? 'text-blue-400'       :
    'text-white'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 flex-shrink-0 min-w-[120px] hover:border-gray-700 transition-colors">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5 whitespace-nowrap">
        {label}
      </p>
      <p className={`text-2xl font-black tabular-nums leading-none ${valueClass}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-700 mt-1 whitespace-nowrap">{sub}</p>}
    </div>
  )
}

function GoalCard({ qualified, goal }: { qualified: number; goal: number }) {
  const pct = goal > 0 ? Math.min((qualified / goal) * 100, 100) : 0
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-4 flex-shrink-0 min-w-[190px] hover:border-gray-700 transition-colors">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
        Team Goal
      </p>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-black tabular-nums ${qualified > 0 ? 'text-kimmel-yellow' : 'text-gray-700'}`}>
          {qualified}
        </span>
        <span className="text-sm text-gray-600">/ {goal}</span>
      </div>
      <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${qualified > 0 ? 'bg-kimmel-yellow' : 'bg-gray-800'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function SummaryBar({ stats, daysRemaining, settings }: Props) {
  return (
    <div className="overflow-x-auto pb-1 -mx-1 px-1">
      <div className="flex gap-3 min-w-max">
        <GoalCard qualified={stats.qualifiedLeads} goal={settings.teamGoal} />
        <StatCard label="Qualified"    value={stats.qualifiedLeads}  accent="yellow" zero />
        <StatCard label="Pending"      value={stats.pendingLeads}    zero />
        <StatCard label="Contacted"    value={stats.contacted}       accent="blue" zero />
        <StatCard label="Appt Set"     value={stats.appointmentSet}  accent="blue" zero />
        <StatCard label="Proposals"    value={stats.proposalSent}    accent="blue" zero />
        <StatCard label="Closed Won"   value={stats.closedWon}       accent="green" zero />
        <StatCard label="Closed Lost"  value={stats.closedLost}      accent="red"   zero />
        <StatCard
          label="Lead Payout"
          value={fmt$(stats.leadPayout)}
          sub={`${stats.qualifiedLeads} × ${fmt$(settings.leadPayoutAmount)}`}
          accent="yellow"
          zero
        />
        <StatCard
          label="Close Payout"
          value={fmt$(stats.closePayout)}
          sub={`${stats.closedWon} closes`}
          accent="green"
          zero
        />
        <StatCard
          label="Total Payout"
          value={fmt$(stats.totalPayout)}
          sub="lead + close"
          accent={stats.totalPayout > 0 ? 'yellow' : 'none'}
          zero
        />
        <StatCard
          label="CSRs at Goal"
          value={`${stats.csrsAtGoal}/${settings.csrList.length}`}
          accent={stats.csrsAtGoal > 0 ? 'green' : 'none'}
          zero
        />
        <StatCard
          label="Days Left"
          value={daysRemaining}
          accent={daysRemaining <= 3 ? 'red' : daysRemaining <= 7 ? 'yellow' : 'none'}
        />
      </div>
    </div>
  )
}
