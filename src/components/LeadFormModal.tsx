import { useState } from 'react'
import type { Lead, Settings } from '../types'
import { today, getClosePayout, fmt$ } from '../utils/calculations'
import { QualBadge, StageBadge } from './LeadTable'

interface Props {
  lead:     Lead | null           // null = add mode
  settings: Settings
  leads:    Lead[]
  onSave:   (l: Lead) => void
  onClose:  () => void
}

type FormData = Omit<Lead, 'id' | 'leadNumber' | 'lastUpdated'>

function emptyForm(settings: Settings): FormData {
  return {
    dateSubmitted:      today(),
    csrId:              '',
    csrName:            '',
    routeNumber:        '',
    businessName:       '',
    contactName:        '',
    phone:              '',
    email:              '',
    leadType:           settings.leadTypes[0] ?? '',
    competitor:         '',
    notes:              '',
    qualStatus:         settings.qualStatuses[0] ?? 'Pending Review',
    salesOwner:         settings.salesReps[0] ?? '',
    followUpStatus:     settings.followUpStatuses[0] ?? 'Not Contacted',
    salesNotes:         '',
    routeVisibleUpdate: '',
    estimatedValue:     0,
  }
}

export default function LeadFormModal({ lead, settings, leads, onSave, onClose }: Props) {
  const isEdit = lead !== null
  const [form, setForm] = useState<FormData>(
    isEdit
      ? { ...lead }
      : emptyForm(settings),
  )

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  // When CSR changes, auto-fill route number
  const handleCSRChange = (csrId: string) => {
    const csr = settings.csrList.find(c => c.id === csrId)
    setForm(f => ({ ...f, csrId, csrName: csr?.name ?? '', routeNumber: csr?.routeNumber ?? '' }))
  }

  const isQual   = form.qualStatus === 'Qualified'
  const isClosed = form.followUpStatus === 'Closed Won'
  const lp = isQual   ? settings.leadPayoutAmount : 0
  const cp = isClosed ? getClosePayout(settings)   : 0

  const canSave = form.csrId !== '' && form.businessName.trim() !== ''

  const handleSave = () => {
    if (!canSave) return
    if (isEdit && lead) {
      onSave({ ...lead, ...form })
    } else {
      onSave(form as Lead)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-modal w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div>
            <h2 className="text-lg font-black text-white">
              {isEdit ? `Edit Lead — ${lead!.leadNumber}` : 'Add New Lead'}
            </h2>
            {isEdit && <p className="text-xs text-gray-500 mt-0.5">{lead!.businessName}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">

          {/* ── Lead submission info ──────────────────────────────────────── */}
          <section>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Lead Submission
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">CSR <span className="text-red-500">*</span></label>
                <select
                  className={`select-field ${!form.csrId ? 'border-amber-500/40' : ''}`}
                  value={form.csrId}
                  onChange={e => handleCSRChange(e.target.value)}
                >
                  <option value="">— Select CSR —</option>
                  {settings.csrList.map(c => (
                    <option key={c.id} value={c.id}>{c.name} (Rt {c.routeNumber})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date Submitted</label>
                <input type="date" className="input-field" value={form.dateSubmitted} onChange={e => set('dateSubmitted', e.target.value)} />
              </div>
              <div>
                <label className="label">Lead Type</label>
                <select className="select-field" value={form.leadType} onChange={e => set('leadType', e.target.value)}>
                  {settings.leadTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Competitor (if Competitive Truck)</label>
                <input type="text" className="input-field" placeholder="Competitor name or blank" value={form.competitor} onChange={e => set('competitor', e.target.value)} />
              </div>
            </div>
          </section>

          {/* ── Business & contact ────────────────────────────────────────── */}
          <section className="border-t border-gray-800 pt-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Business & Contact Info
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Business Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={`input-field ${!form.businessName.trim() ? 'border-amber-500/40' : ''}`}
                  placeholder="Business name"
                  value={form.businessName}
                  onChange={e => set('businessName', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Contact Name</label>
                <input type="text" className="input-field" placeholder="Name" value={form.contactName} onChange={e => set('contactName', e.target.value)} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" className="input-field" placeholder="(555) 000-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label">Email</label>
                <input type="email" className="input-field" placeholder="email@business.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="label">CSR Notes / Observations</label>
                <textarea
                  className="input-field h-20 resize-none"
                  placeholder="What did you see? Any details that might help sales..."
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ── Qualification ─────────────────────────────────────────────── */}
          <section className="border-t border-gray-800 pt-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Qualification
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Qualification Status</label>
                <select className="select-field" value={form.qualStatus} onChange={e => set('qualStatus', e.target.value)}>
                  {settings.qualStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-2">
                <QualBadge status={form.qualStatus} />
              </div>
            </div>
          </section>

          {/* ── Sales feedback ────────────────────────────────────────────── */}
          <section className="border-t border-gray-800 pt-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Sales Feedback
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Assigned Sales Rep</label>
                <select className="select-field" value={form.salesOwner} onChange={e => set('salesOwner', e.target.value)}>
                  {settings.salesReps.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Follow-Up Stage</label>
                <select className="select-field" value={form.followUpStatus} onChange={e => set('followUpStatus', e.target.value)}>
                  {settings.followUpStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Sales Notes / Outcome (internal)</label>
                <textarea
                  className="input-field h-24 resize-none"
                  placeholder="Latest action, next step, outcome..."
                  value={form.salesNotes}
                  onChange={e => set('salesNotes', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <label className="label">
                  Route-Visible Update
                  <span className="ml-1.5 text-gray-700 normal-case tracking-normal font-normal">
                    (what the route rep sees — keep it clear and positive)
                  </span>
                </label>
                <textarea
                  className="input-field h-16 resize-none border-kimmel-yellow-ring"
                  placeholder="e.g. ✅ Sales made first contact — appointment coming soon!"
                  value={form.routeVisibleUpdate}
                  onChange={e => set('routeVisibleUpdate', e.target.value)}
                />
              </div>
              <div>
                <label className="label">Estimated Annual Value ($)</label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="0"
                  value={form.estimatedValue || ''}
                  onChange={e => set('estimatedValue', Number(e.target.value))}
                />
              </div>
            </div>
          </section>

          {/* ── Payout calc (read-only) ───────────────────────────────────── */}
          <section className="border-t border-gray-800 pt-5">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
              Payout Preview
            </h3>
            <div className="bg-gray-800/40 rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
              {[
                { label: `Lead payout (if qualified)`,  value: fmt$(lp), active: isQual,   accent: 'text-kimmel-yellow' },
                { label: `Close bonus (if closed won)`, value: fmt$(cp), active: isClosed, accent: 'text-emerald-400' },
                { label: `Total this lead`,              value: fmt$(lp + cp), active: lp + cp > 0, accent: 'text-kimmel-yellow' },
              ].map(({ label, value, active, accent }) => (
                <div key={label}>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-2xl font-black tabular-nums ${active ? accent : 'text-gray-700'}`}>{value}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <StageBadge status={form.followUpStatus} />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`btn-primary ${!canSave ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              {isEdit ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
