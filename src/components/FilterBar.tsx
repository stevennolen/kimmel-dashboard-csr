import type { FilterState, Settings } from '../types'

interface Props {
  filters:   FilterState
  onChange:  (f: FilterState) => void
  settings:  Settings
  open:      boolean
  onToggle:  () => void
  hasActive: boolean
  onClear:   () => void
}

export default function FilterBar({ filters, onChange, settings, open, onToggle, hasActive, onClear }: Props) {
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    onChange({ ...filters, [k]: v })

  const activeCount = Object.entries(filters).filter(([, v]) => typeof v === 'boolean' ? v : v !== '').length

  return (
    <div className="card">
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[160px] max-w-sm">
          <input
            type="text"
            className="input-field py-1.5"
            placeholder="Search business, contact, CSR…"
            value={filters.search}
            onChange={e => set('search', e.target.value)}
          />
        </div>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className="btn-ghost text-xs flex items-center gap-1.5"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Filters
          {hasActive && (
            <span className="bg-kimmel-yellow text-black text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </button>

        {/* Quick pills */}
        <button
          onClick={() => set('qualifiedOnly', !filters.qualifiedOnly)}
          className={`stat-pill cursor-pointer transition-colors ${
            filters.qualifiedOnly
              ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
              : 'bg-gray-800 text-gray-500 hover:text-gray-300'
          }`}
        >
          ✓ Qualified
        </button>
        <button
          onClick={() => set('closedOnly', !filters.closedOnly)}
          className={`stat-pill cursor-pointer transition-colors ${
            filters.closedOnly
              ? 'bg-kimmel-yellow-bg text-kimmel-yellow ring-1 ring-kimmel-yellow-ring'
              : 'bg-gray-800 text-gray-500 hover:text-gray-300'
          }`}
        >
          🏆 Won
        </button>

        {hasActive && (
          <button onClick={onClear} className="btn-ghost text-xs text-red-400 hover:text-red-300">
            Clear
          </button>
        )}
      </div>

      {open && (
        <div className="border-t border-gray-800 px-4 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="label">CSR</label>
            <select className="select-field" value={filters.csr} onChange={e => set('csr', e.target.value)}>
              <option value="">All CSRs</option>
              {settings.csrList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Route #</label>
            <select className="select-field" value={filters.routeNumber} onChange={e => set('routeNumber', e.target.value)}>
              <option value="">All</option>
              {settings.csrList.map(c => <option key={c.id} value={c.routeNumber}>{c.routeNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Sales Rep</label>
            <select className="select-field" value={filters.salesRep} onChange={e => set('salesRep', e.target.value)}>
              <option value="">All</option>
              {settings.salesReps.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Lead Type</label>
            <select className="select-field" value={filters.leadType} onChange={e => set('leadType', e.target.value)}>
              <option value="">All</option>
              {settings.leadTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Qual Status</label>
            <select className="select-field" value={filters.qualStatus} onChange={e => set('qualStatus', e.target.value)}>
              <option value="">All</option>
              {settings.qualStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Follow-Up</label>
            <select className="select-field" value={filters.followUpStatus} onChange={e => set('followUpStatus', e.target.value)}>
              <option value="">All</option>
              {settings.followUpStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date From</label>
            <input type="date" className="input-field" value={filters.dateFrom} onChange={e => set('dateFrom', e.target.value)} />
          </div>
          <div>
            <label className="label">Date To</label>
            <input type="date" className="input-field" value={filters.dateTo} onChange={e => set('dateTo', e.target.value)} />
          </div>
        </div>
      )}
    </div>
  )
}
