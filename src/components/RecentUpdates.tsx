import type { Lead } from '../types'

interface Props { leads: Lead[] }

const BOILERPLATE = ['⏳', 'Under review', 'Lead received']

function hasRealUpdate(l: Lead): boolean {
  if (!l.routeVisibleUpdate) return false
  return !BOILERPLATE.some(p => l.routeVisibleUpdate.includes(p))
}

function icon(status: string): string {
  const m: Record<string, string> = {
    'Closed Won': '🏆', 'Proposal Sent': '📋', 'Appointment Set': '📅',
    'Contacted': '📞', 'Closed Lost': '❌',
  }
  return m[status] ?? '⏳'
}

export default function RecentUpdates({ leads }: Props) {
  const updated = leads
    .filter(hasRealUpdate)
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, 8)

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="font-black text-white">Recent Updates</h3>
        <p className="text-xs text-gray-600 mt-0.5">Visible to route reps</p>
      </div>

      {updated.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">📢</p>
          <p className="text-gray-600 text-sm">No updates yet.</p>
          <p className="text-gray-700 text-xs mt-1">Sales updates will appear here as they are entered.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {updated.map((lead, i) => (
            <div key={lead.id} className="flex gap-3">
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center text-sm">
                  {icon(lead.followUpStatus)}
                </div>
                {i < updated.length - 1 && (
                  <div className="w-px flex-1 bg-gray-800 mt-1 min-h-[8px]" />
                )}
              </div>
              <div className="pb-3 min-w-0">
                <p className="text-xs text-gray-400 leading-relaxed">{lead.routeVisibleUpdate}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span className="text-[10px] text-gray-600 font-mono">{lead.leadNumber}</span>
                  <span className="text-gray-800 text-[10px]">·</span>
                  <span className="text-[10px] text-gray-600">{lead.csrName} Rt {lead.routeNumber}</span>
                  <span className="text-gray-800 text-[10px]">·</span>
                  <span className="text-[10px] text-gray-700 tabular-nums">{lead.lastUpdated}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
