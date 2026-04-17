import type { Settings, ContestState, TabId } from '../types'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview',    label: 'Overview',       icon: '▦' },
  { id: 'leaderboard', label: 'Leaderboard',    icon: '🏆' },
  { id: 'leads',       label: 'Leads',          icon: '📋' },
  { id: 'feedback',    label: 'Sales Feedback', icon: '💬' },
]

interface Props {
  settings:       Settings
  contestState:   ContestState
  daysRemaining:  number
  activeTab:      TabId
  onTabChange:    (t: TabId) => void
  onOpenSettings: () => void
  onStartContest: () => void
  onAddLead:      () => void
}

export default function AppHeader({
  settings, contestState, daysRemaining,
  activeTab, onTabChange, onOpenSettings, onStartContest, onAddLead,
}: Props) {
  const urgencyClass =
    daysRemaining <= 3 ? 'text-red-400 bg-red-500/10 border-red-500/25' :
    daysRemaining <= 7 ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' :
                         'text-kimmel-yellow bg-kimmel-yellow-bg border-kimmel-yellow-ring'

  const countdownLabel = !contestState.started
    ? 'Not started'
    : contestState.paused
    ? 'Paused'
    : daysRemaining === 0
    ? 'Contest over'
    : `${daysRemaining}d left`

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top row */}
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 bg-kimmel-yellow rounded-xl flex items-center justify-center shadow-sm shadow-kimmel-yellow/30">
              <span className="text-black font-black text-lg select-none leading-none">K</span>
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Kimmel Uniform &amp; Linen</p>
              <p className="text-sm font-bold text-white">{settings.contestTitle}</p>
            </div>
          </div>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`tab-btn flex items-center gap-1.5 ${activeTab === tab.id ? 'tab-active' : 'tab-default'}`}
              >
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Days remaining */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${urgencyClass}`}>
              <span className="text-xl font-black tabular-nums leading-none">{daysRemaining}</span>
              <div className="text-[10px] font-medium opacity-80 leading-tight hidden sm:block">
                <p>days</p><p>left</p>
              </div>
            </div>

            {/* Start contest (only when not started) */}
            {!contestState.started && (
              <button
                onClick={onStartContest}
                className="btn-primary hidden sm:inline-flex"
              >
                🚀 Start Contest
              </button>
            )}

            {/* Add lead shortcut */}
            <button onClick={onAddLead} className="btn-primary">
              + Lead
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="btn-secondary"
              title="Edit Settings"
            >
              <span className="text-base">⚙</span>
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-1 pb-2.5 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-btn flex items-center gap-1 text-xs whitespace-nowrap ${
                activeTab === tab.id ? 'tab-active' : 'bg-gray-800 text-gray-400'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Contest status banner */}
        {contestState.started && (
          <div className={`flex items-center justify-between px-3 py-1.5 mb-1 rounded-xl text-xs font-medium
            ${contestState.paused
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : daysRemaining === 0
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            <span>
              {contestState.paused ? '⏸ Contest paused' : daysRemaining === 0 ? '🏁 Contest has ended' : '🟢 Contest in progress'}
              {contestState.startDate && !contestState.paused && ` · Started ${contestState.startDate}`}
            </span>
            <span className="opacity-60">{countdownLabel}</span>
          </div>
        )}
      </div>
    </header>
  )
}
