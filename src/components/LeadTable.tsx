import { useState } from 'react'
import type { Lead } from '../types'
import { exportLeadsCSV } from '../utils/calculations'

interface Props {
  leads:    Lead[]
  onEdit:   (l: Lead) => void
  onDelete: (id: string) => void
}

// ── Badges ────────────────────────────────────────────────────────────────────
export function QualBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Qualified':      'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25',
    'Pending Review': 'bg-amber-500/15   text-amber-400  ring-1 ring-amber-500/25',
    'Disqualified':   'bg-red-500/15     text-red-400    ring-1 ring-red-500/25',
  }
  return <span className={`stat-pill ${map[status] ?? 'bg-gray-800 text-gray-500'}`}>{status}</span>
}

export function StageBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Not Contacted':   'bg-gray-700      text-gray-500',
    'Contacted':       'bg-blue-500/15   text-blue-400   ring-1 ring-blue-500/25',
    'Appointment Set': 'bg-purple-500/15 text-purple-400 ring-1 ring-purple-500/25',
    'Proposal Sent':   'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/25',
    'Closed Won':      'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/25',
    'Closed Lost':     'bg-red-500/15    text-red-400    ring-1 ring-red-500/25',
  }
  return <span className={`stat-pill ${map[status] ?? 'bg-gray-800 text-gray-500'}`}>{status}</span>
}

export function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    'Competitive Truck':    'bg-rose-500/10   text-rose-400',
    'New Business Opening': 'bg-sky-500/10    text-sky-400',
    'New Construction':     'bg-orange-500/10 text-orange-400',
  }
  return <span className={`stat-pill ${map[type] ?? 'bg-gray-800 text-gray-400'}`}>{type}</span>
}

// ── Sort helper ───────────────────────────────────────────────────────────────
type SortKey = 'dateSubmitted' | 'csrName' | 'businessName' | 'qualStatus' | 'followUpStatus' | 'estimatedValue'

export default function LeadTable({ leads, onEdit, onDelete }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('dateSubmitted')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(k); setSortDir('asc') }
  }

  const sorted = [...leads].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey]
    const cmp = typeof av === 'number'
      ? av - (bv as number)
      : String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  const Th = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      className="text-left pb-3 px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider
                 cursor-pointer hover:text-gray-300 transition-colors whitespace-nowrap select-none"
      onClick={() => handleSort(k)}
    >
      {label}{sortKey === k && <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </th>
  )

  if (leads.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-3xl mb-4">📭</div>
        <h3 className="text-lg font-bold text-white mb-1">No leads yet</h3>
        <p className="text-sm text-gray-500">
          {leads.length === 0 ? 'Click "+ Lead" in the header or "+ Add Lead" above to submit the first lead.' : 'No leads match your current filters.'}
        </p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Table toolbar */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <p className="text-xs text-gray-500">{leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => exportLeadsCSV(leads)}
          className="btn-ghost text-xs"
          title="Download as CSV"
        >
          ↓ Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[1300px]">
          <thead className="border-b border-gray-800">
            <tr>
              <th className="text-left pb-3 px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">#</th>
              <Th label="Date"       k="dateSubmitted"  />
              <th className="text-left pb-3 px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">CSR / Route</th>
              <Th label="Business"   k="businessName"   />
              <th className="text-left pb-3 px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Contact</th>
              <th className="text-left pb-3 px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Type</th>
              <Th label="Qual"       k="qualStatus"     />
              <th className="text-left pb-3 px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">Sales</th>
              <Th label="Stage"      k="followUpStatus" />
              <Th label="Est. Value" k="estimatedValue" />
              <th className="text-left pb-3 px-3 text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Route Update</th>
              <th className="pb-3 px-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/40">
            {sorted.map(lead => (
              <tr
                key={lead.id}
                className="hover:bg-gray-800/40 transition-colors group"
              >
                <td className="py-3 px-3">
                  <span className="text-gray-600 font-mono text-xs">{lead.leadNumber}</span>
                </td>
                <td className="py-3 px-3 text-gray-500 text-xs tabular-nums whitespace-nowrap">{lead.dateSubmitted}</td>
                <td className="py-3 px-3">
                  <p className="text-white font-medium text-xs">{lead.csrName}</p>
                  <p className="text-gray-700 text-[10px]">Rt {lead.routeNumber}</p>
                </td>
                <td className="py-3 px-3">
                  <p
                    className="text-white font-semibold max-w-[180px] truncate cursor-pointer hover:text-kimmel-yellow transition-colors"
                    onClick={() => onEdit(lead)}
                  >
                    {lead.businessName}
                  </p>
                </td>
                <td className="py-3 px-3">
                  <p className="text-gray-400 text-xs max-w-[140px] truncate">{lead.contactName || '—'}</p>
                  <p className="text-gray-700 text-[10px] truncate">{lead.phone || ''}</p>
                </td>
                <td className="py-3 px-3 whitespace-nowrap"><TypeBadge type={lead.leadType} /></td>
                <td className="py-3 px-3 whitespace-nowrap"><QualBadge status={lead.qualStatus} /></td>
                <td className="py-3 px-3 text-gray-500 text-xs whitespace-nowrap">{lead.salesOwner || '—'}</td>
                <td className="py-3 px-3 whitespace-nowrap"><StageBadge status={lead.followUpStatus} /></td>
                <td className="py-3 px-3 text-right text-gray-400 text-xs tabular-nums whitespace-nowrap">
                  {lead.estimatedValue > 0 ? `$${lead.estimatedValue.toLocaleString()}` : '—'}
                </td>
                <td className="py-3 px-3 max-w-[200px]">
                  <p className="text-xs text-gray-500 truncate">{lead.routeVisibleUpdate || '—'}</p>
                </td>
                {/* Actions */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {confirmDelete === lead.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { onDelete(lead.id); setConfirmDelete(null) }}
                        className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(lead)}
                        className="text-gray-500 hover:text-kimmel-yellow transition-colors text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDelete(lead.id)}
                        className="text-gray-700 hover:text-red-400 transition-colors text-xs"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
