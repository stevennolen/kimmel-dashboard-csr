import type { Lead } from '../types'
import { StageBadge } from './LeadTable'

interface Props { leads: Lead[]; onEdit: (l: Lead) => void }

export default function HotLeads({ leads, onEdit }: Props) {
  const hot = leads
    .filter(l =>
      l.qualStatus === 'Qualified' &&
      ['Appointment Set', 'Proposal Sent'].includes(l.followUpStatus),
    )
    .sort((a, b) => b.estimatedValue - a.estimatedValue)
    .slice(0, 6)

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-white">🔥 Hot Leads</h3>
          <p className="text-xs text-gray-600 mt-0.5">Appointments &amp; proposals</p>
        </div>
        <span className={`text-2xl font-black ${hot.length > 0 ? 'text-kimmel-yellow' : 'text-gray-700'}`}>
          {hot.length}
        </span>
      </div>

      {hot.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-gray-600 text-sm">No hot leads yet.</p>
          <p className="text-gray-700 text-xs mt-1">Leads with active appointments or proposals will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {hot.map(lead => (
            <button
              key={lead.id}
              onClick={() => onEdit(lead)}
              className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700/40 hover:border-gray-600 rounded-xl px-4 py-3 transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-semibold text-white group-hover:text-kimmel-yellow transition-colors truncate leading-tight">
                  {lead.businessName}
                </p>
                {lead.estimatedValue > 0 && (
                  <span className="text-xs text-emerald-400 font-bold tabular-nums flex-shrink-0">
                    ${lead.estimatedValue.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StageBadge status={lead.followUpStatus} />
                <span className="text-[10px] text-gray-600">{lead.csrName}</span>
              </div>
              {lead.routeVisibleUpdate && (
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed line-clamp-2">
                  {lead.routeVisibleUpdate}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
