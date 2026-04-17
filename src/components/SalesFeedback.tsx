import type { Lead } from '../types'
import { QualBadge, StageBadge, TypeBadge } from './LeadTable'

interface Props {
  leads:  Lead[]
  onEdit: (l: Lead) => void
}

function FeedbackCard({ lead, onEdit }: { lead: Lead; onEdit: (l: Lead) => void }) {
  const isWon      = lead.followUpStatus === 'Closed Won'
  const isProposal = lead.followUpStatus === 'Proposal Sent'
  const isAppt     = lead.followUpStatus === 'Appointment Set'

  const border = isWon      ? 'border-emerald-500/30' :
                 isProposal ? 'border-indigo-500/25'   :
                 isAppt     ? 'border-purple-500/25'   :
                 'border-gray-800'

  return (
    <div
      className={`card-hover border ${border} p-5 cursor-pointer`}
      onClick={() => onEdit(lead)}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="font-bold text-white text-sm truncate leading-tight">{lead.businessName}</p>
          <p className="text-[10px] text-gray-600 mt-0.5">
            {lead.leadNumber} · {lead.csrName} · Rt {lead.routeNumber}
          </p>
        </div>
        <StageBadge status={lead.followUpStatus} />
      </div>

      {/* Type + qual badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <TypeBadge type={lead.leadType} />
        <QualBadge status={lead.qualStatus} />
        {lead.salesOwner && (
          <span className="stat-pill bg-gray-800 text-gray-500">👤 {lead.salesOwner}</span>
        )}
      </div>

      {/* Route-visible update (highlighted) */}
      {lead.routeVisibleUpdate ? (
        <div className="bg-kimmel-yellow-bg border border-kimmel-yellow-ring rounded-xl px-4 py-3 mb-3">
          <p className="text-[10px] text-kimmel-yellow uppercase tracking-wider font-semibold mb-1">Route Update</p>
          <p className="text-sm text-gray-200 leading-relaxed">{lead.routeVisibleUpdate}</p>
        </div>
      ) : (
        <div className="bg-gray-800/40 rounded-xl px-4 py-3 mb-3">
          <p className="text-xs text-gray-600 italic">No route update posted yet.</p>
        </div>
      )}

      {/* Sales notes (internal) */}
      {lead.salesNotes && (
        <div className="bg-gray-800/50 rounded-xl px-4 py-3 mb-3">
          <p className="text-[10px] text-gray-700 uppercase tracking-wider font-semibold mb-1">Sales Notes</p>
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{lead.salesNotes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between text-[10px] text-gray-700 mt-1">
        <span>{lead.estimatedValue > 0 ? `Est. $${lead.estimatedValue.toLocaleString()}` : 'No est. value'}</span>
        <span>Updated {lead.lastUpdated}</span>
      </div>
    </div>
  )
}

function Section({ title, count, accent, children }: {
  title: string; count: number; accent?: string; children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h3 className={`text-sm font-bold uppercase tracking-wider ${accent ?? 'text-gray-500'}`}>{title}</h3>
        <span className="bg-gray-800 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
      </div>
      {children}
    </section>
  )
}

const STAGE_ORDER: Record<string, number> = {
  'Proposal Sent': 0, 'Appointment Set': 1, 'Contacted': 2,
  'Closed Won': 3, 'Closed Lost': 4, 'Not Contacted': 5,
}

export default function SalesFeedback({ leads, onEdit }: Props) {
  if (leads.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-3xl mb-4">💬</div>
        <h3 className="text-lg font-bold text-white mb-1">No leads to show</h3>
        <p className="text-sm text-gray-500">Add qualified leads and sales feedback will appear here.</p>
      </div>
    )
  }

  const active    = leads
    .filter(l => l.qualStatus === 'Qualified' && ['Contacted','Appointment Set','Proposal Sent'].includes(l.followUpStatus))
    .sort((a, b) => (STAGE_ORDER[a.followUpStatus] ?? 9) - (STAGE_ORDER[b.followUpStatus] ?? 9))

  const needsContact = leads.filter(l => l.qualStatus === 'Qualified' && l.followUpStatus === 'Not Contacted')
  const pending      = leads.filter(l => l.qualStatus === 'Pending Review')
  const won          = leads.filter(l => l.followUpStatus === 'Closed Won')
  const lost         = leads.filter(l => l.followUpStatus === 'Closed Lost')

  const grid = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
  const Empty = ({ msg }: { msg: string }) => (
    <div className="card border-dashed p-8 text-center col-span-3">
      <p className="text-gray-600 text-sm">{msg}</p>
    </div>
  )

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-black text-white">Sales Feedback</h2>
        <p className="text-sm text-gray-500 mt-0.5">Click any card to update stage, notes, or the route-visible update.</p>
      </div>

      <Section title="Active Pipeline" count={active.length} accent="text-blue-400">
        {active.length === 0
          ? <Empty msg="No leads in active pipeline." />
          : <div className={grid}>{active.map(l => <FeedbackCard key={l.id} lead={l} onEdit={onEdit} />)}</div>
        }
      </Section>

      {needsContact.length > 0 && (
        <Section title="Needs First Contact" count={needsContact.length} accent="text-amber-400">
          <div className={grid}>{needsContact.map(l => <FeedbackCard key={l.id} lead={l} onEdit={onEdit} />)}</div>
        </Section>
      )}

      {pending.length > 0 && (
        <Section title="Pending Qualification" count={pending.length}>
          <div className={grid}>{pending.map(l => <FeedbackCard key={l.id} lead={l} onEdit={onEdit} />)}</div>
        </Section>
      )}

      {won.length > 0 && (
        <Section title="Closed Won 🏆" count={won.length} accent="text-emerald-400">
          <div className={grid}>{won.map(l => <FeedbackCard key={l.id} lead={l} onEdit={onEdit} />)}</div>
        </Section>
      )}

      {lost.length > 0 && (
        <Section title="Closed Lost" count={lost.length} accent="text-red-400">
          <div className={grid}>{lost.map(l => <FeedbackCard key={l.id} lead={l} onEdit={onEdit} />)}</div>
        </Section>
      )}
    </div>
  )
}
