import { useState } from 'react'
import type { Settings, ContestState, CSRConfig } from '../types'
import { getDaysRemaining, closePayoutLabel, fmt$ } from '../utils/calculations'
import { DEFAULT_SETTINGS } from '../config/defaults'

interface Props {
  open:             boolean
  settings:         Settings
  contestState:     ContestState
  daysRemaining:    number
  onUpdateSettings: (s: Settings) => void
  onUpdateContest:  (c: ContestState) => void
  onClose:          () => void
  onStartContest:   () => void
  onPauseContest:   () => void
  onResetContest:   () => void
  onClearLeads:     () => void
}

// ── Reusable editable string list ─────────────────────────────────────────────
function EditableList({
  label, items, onChange,
}: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (!v || items.includes(v)) return
    onChange([...items, v]); setDraft('')
  }
  return (
    <div>
      <p className="label">{label}</p>
      <div className="space-y-1.5 mb-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              className="input-field py-1.5 flex-1"
              value={item}
              onChange={e => {
                const next = [...items]; next[i] = e.target.value; onChange(next)
              }}
            />
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-gray-600 hover:text-red-400 transition-colors w-6 h-6 flex items-center justify-center rounded flex-shrink-0 text-lg leading-none"
              title="Remove"
            >×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="input-field py-1.5 flex-1"
          placeholder={`Add ${label.toLowerCase()}…`}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
        <button onClick={add} className="btn-secondary flex-shrink-0">+ Add</button>
      </div>
    </div>
  )
}

// ── Collapsible section ───────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = false }: {
  title: string; icon: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-800 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-bold text-gray-200">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  )
}

// ── CSR row editor ────────────────────────────────────────────────────────────
function CSRRow({
  csr, onSave, onDelete,
}: { csr: CSRConfig; onSave: (c: CSRConfig) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState(csr.name)
  const [route, setRoute]     = useState(csr.routeNumber)

  const save = () => { onSave({ ...csr, name: name.trim() || csr.name, routeNumber: route.trim() || csr.routeNumber }); setEditing(false) }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input type="text" className="input-field py-1.5 flex-1" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <input type="text" className="input-field py-1.5 w-16" value={route} onChange={e => setRoute(e.target.value)} placeholder="Rt #" />
        <button onClick={save} className="btn-primary flex-shrink-0 py-1.5 px-3">✓</button>
        <button onClick={() => setEditing(false)} className="btn-ghost text-xs flex-shrink-0">Cancel</button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-1.5 group">
      <div className="flex items-center gap-3">
        <span className="stat-pill bg-kimmel-yellow-bg text-kimmel-yellow">Rt {csr.routeNumber}</span>
        <span className="text-sm text-gray-300 font-medium">{csr.name}</span>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="text-gray-500 hover:text-kimmel-yellow transition-colors text-xs">Edit</button>
        <button onClick={onDelete} className="text-gray-700 hover:text-red-400 transition-colors text-sm leading-none">×</button>
      </div>
    </div>
  )
}

// ── Main drawer ───────────────────────────────────────────────────────────────
export default function SettingsDrawer({
  open, settings, contestState, daysRemaining,
  onUpdateSettings, onUpdateContest, onClose,
  onStartContest, onPauseContest, onResetContest, onClearLeads,
}: Props) {
  const s = settings
  const upd = (patch: Partial<Settings>) => onUpdateSettings({ ...s, ...patch })

  // New CSR form
  const [newCSRName,  setNewCSRName]  = useState('')
  const [newCSRRoute, setNewCSRRoute] = useState('')
  const addCSR = () => {
    const name = newCSRName.trim(); const route = newCSRRoute.trim()
    if (!name) return
    upd({ csrList: [...s.csrList, { id: `csr-${Date.now()}`, name, routeNumber: route }] })
    setNewCSRName(''); setNewCSRRoute('')
  }

  // Manual days override in settings
  const [daysOverride, setDaysOverride] = useState(
    contestState.manualDaysLeft !== null ? String(contestState.manualDaysLeft) : '',
  )
  const applyDaysOverride = () => {
    const n = parseInt(daysOverride, 10)
    onUpdateContest({ ...contestState, manualDaysLeft: isNaN(n) ? null : Math.max(0, n) })
  }
  const clearOverride = () => {
    setDaysOverride('')
    onUpdateContest({ ...contestState, manualDaysLeft: null })
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[480px] bg-gray-900 border-l border-gray-800 z-50 shadow-drawer flex flex-col">

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-kimmel-yellow-bg rounded-lg flex items-center justify-center">
              <span className="text-kimmel-yellow text-base">⚙</span>
            </div>
            <div>
              <p className="font-black text-white text-sm">Settings</p>
              <p className="text-[10px] text-gray-600">Changes save instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">

          {/* ── Contest control ────────────────────────────────────────────── */}
          <Section title="Contest Control" icon="🏁" defaultOpen>
            {/* Title */}
            <div>
              <label className="label">Contest Title</label>
              <input
                type="text"
                className="input-field"
                value={s.contestTitle}
                onChange={e => upd({ contestTitle: e.target.value })}
              />
            </div>

            {/* Duration */}
            <div>
              <label className="label">Contest Duration (days)</label>
              <input
                type="number" min="1" max="365"
                className="input-field"
                value={s.contestDuration}
                onChange={e => upd({ contestDuration: Math.max(1, parseInt(e.target.value) || 1) })}
              />
            </div>

            {/* Status and controls */}
            <div>
              <label className="label">Contest Status</label>
              <div className={`rounded-xl px-4 py-3 text-sm font-medium mb-3 ${
                !contestState.started ? 'bg-gray-800 text-gray-400' :
                contestState.paused   ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                daysRemaining === 0   ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {!contestState.started ? `⬜ Not started — showing ${s.contestDuration} days as default` :
                 contestState.paused   ? `⏸ Paused — ${daysRemaining} days remaining` :
                 daysRemaining === 0   ? '🏁 Contest has ended' :
                 `🟢 Running — ${daysRemaining} days remaining · started ${contestState.startDate}`}
              </div>

              <div className="flex flex-wrap gap-2">
                {!contestState.started && (
                  <button onClick={() => { onStartContest(); }} className="btn-primary">
                    🚀 Start Contest
                  </button>
                )}
                {contestState.started && !contestState.paused && (
                  <button onClick={onPauseContest} className="btn-secondary">
                    ⏸ Pause
                  </button>
                )}
                {contestState.started && contestState.paused && (
                  <button onClick={onPauseContest} className="btn-secondary">
                    ▶ Resume
                  </button>
                )}
                {contestState.started && (
                  <button
                    onClick={() => { if (window.confirm('Reset the contest? This clears the start date and countdown.')) onResetContest() }}
                    className="btn-danger"
                  >
                    ↺ Reset Contest
                  </button>
                )}
              </div>
            </div>

            {/* Manual override */}
            <div>
              <label className="label">
                Manual Days Override
                <span className="ml-1.5 text-gray-700 normal-case tracking-normal font-normal">
                  (overrides auto-calculation)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number" min="0"
                  className="input-field w-28"
                  placeholder="e.g. 7"
                  value={daysOverride}
                  onChange={e => setDaysOverride(e.target.value)}
                />
                <button onClick={applyDaysOverride} className="btn-secondary">Set</button>
                {contestState.manualDaysLeft !== null && (
                  <button onClick={clearOverride} className="btn-ghost text-xs text-red-400">Clear Override</button>
                )}
              </div>
              {contestState.manualDaysLeft !== null && (
                <p className="text-xs text-amber-400 mt-1.5">
                  ⚠ Override active: showing {contestState.manualDaysLeft} days
                </p>
              )}
            </div>
          </Section>

          {/* ── CSRs & Routes ─────────────────────────────────────────────── */}
          <Section title="CSRs & Routes" icon="👷" defaultOpen>
            <p className="text-xs text-gray-600">
              Hover a row to edit name or route number. Changes affect existing lead data labels on save.
            </p>
            <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
              {s.csrList.map((csr, i) => (
                <CSRRow
                  key={csr.id}
                  csr={csr}
                  onSave={updated => {
                    const next = [...s.csrList]; next[i] = updated; upd({ csrList: next })
                  }}
                  onDelete={() => {
                    if (window.confirm(`Remove ${csr.name} from the contest?`))
                      upd({ csrList: s.csrList.filter(c => c.id !== csr.id) })
                  }}
                />
              ))}
            </div>
            {/* Add CSR */}
            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-600 mb-2">Add a CSR:</p>
              <div className="flex gap-2">
                <input type="text" className="input-field py-1.5 flex-1" placeholder="Name" value={newCSRName} onChange={e => setNewCSRName(e.target.value)} />
                <input type="text" className="input-field py-1.5 w-20" placeholder="Rt #" value={newCSRRoute} onChange={e => setNewCSRRoute(e.target.value)} />
                <button onClick={addCSR} className="btn-primary flex-shrink-0 py-1.5 px-3">+ Add</button>
              </div>
            </div>
          </Section>

          {/* ── Goals & Payouts ────────────────────────────────────────────── */}
          <Section title="Goals & Payouts" icon="💰" defaultOpen>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Goal per CSR (leads)</label>
                <input type="number" min="1" className="input-field" value={s.goalPerCSR}
                  onChange={e => upd({ goalPerCSR: Math.max(1, parseInt(e.target.value) || 1) })} />
              </div>
              <div>
                <label className="label">Team Goal (total leads)</label>
                <input type="number" min="1" className="input-field" value={s.teamGoal}
                  onChange={e => upd({ teamGoal: Math.max(1, parseInt(e.target.value) || 1) })} />
              </div>
              <div>
                <label className="label">Lead Payout ($ per qualified lead)</label>
                <input type="number" min="0" className="input-field" value={s.leadPayoutAmount}
                  onChange={e => upd({ leadPayoutAmount: Math.max(0, parseInt(e.target.value) || 0) })} />
              </div>
            </div>

            {/* Close payout */}
            <div>
              <label className="label">Close Payout Formula</label>
              <div className="grid grid-cols-2 gap-3">
                <select className="select-field" value={s.closePayoutType}
                  onChange={e => upd({ closePayoutType: e.target.value as Settings['closePayoutType'] })}>
                  <option value="multiplier">Multiplier (× lead payout)</option>
                  <option value="fixed">Fixed amount ($)</option>
                </select>
                <input type="number" min="0" className="input-field"
                  value={s.closePayoutValue}
                  placeholder={s.closePayoutType === 'multiplier' ? '2' : '20'}
                  onChange={e => upd({ closePayoutValue: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="mt-2 bg-gray-800/50 rounded-xl px-4 py-3 text-xs text-gray-400 leading-relaxed">
                <p>
                  {s.closePayoutType === 'multiplier'
                    ? <>Lead earns <strong className="text-gray-200">{fmt$(s.leadPayoutAmount)}</strong> when qualified + an additional <strong className="text-gray-200">{fmt$(s.leadPayoutAmount * s.closePayoutValue)}</strong> if closed won ({s.closePayoutValue}× multiplier) = <strong className="text-kimmel-yellow">{fmt$(s.leadPayoutAmount + s.leadPayoutAmount * s.closePayoutValue)}</strong> total per closed deal.</>
                    : <>Lead earns <strong className="text-gray-200">{fmt$(s.leadPayoutAmount)}</strong> when qualified + a flat <strong className="text-gray-200">{fmt$(s.closePayoutValue)}</strong> bonus if closed won = <strong className="text-kimmel-yellow">{fmt$(s.leadPayoutAmount + s.closePayoutValue)}</strong> total per closed deal.</>
                  }
                </p>
              </div>
            </div>
          </Section>

          {/* ── Sales Reps ────────────────────────────────────────────────── */}
          <Section title="Sales Reps" icon="💼">
            <EditableList
              label="Sales rep names"
              items={s.salesReps}
              onChange={salesReps => upd({ salesReps })}
            />
          </Section>

          {/* ── Lead Options ──────────────────────────────────────────────── */}
          <Section title="Lead Options" icon="📋">
            <EditableList
              label="Lead types"
              items={s.leadTypes}
              onChange={leadTypes => upd({ leadTypes })}
            />
            <EditableList
              label="Qualification statuses"
              items={s.qualStatuses}
              onChange={qualStatuses => upd({ qualStatuses })}
            />
            <EditableList
              label="Follow-up / sales stages"
              items={s.followUpStatuses}
              onChange={followUpStatuses => upd({ followUpStatuses })}
            />
          </Section>

          {/* ── Danger Zone ───────────────────────────────────────────────── */}
          <div className="px-5 py-5 border-t border-gray-800 space-y-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Danger Zone</p>
            <button
              onClick={() => {
                if (window.confirm('Reset ALL settings to defaults? This cannot be undone.'))
                  onUpdateSettings({ ...DEFAULT_SETTINGS })
              }}
              className="btn-danger w-full justify-center"
            >
              ↺ Reset Settings to Defaults
            </button>
            <button onClick={onClearLeads} className="btn-danger w-full justify-center">
              🗑 Delete All Lead Data
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
