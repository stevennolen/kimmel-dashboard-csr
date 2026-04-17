import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts'
import type { CSRStats } from '../../types'

interface Props { csrStats: CSRStats[] }

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: {value:number;name:string}[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-bold text-white mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: i === 0 ? '#FFCC00' : '#f59e0b' }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

export default function LeadsByCSRChart({ csrStats }: Props) {
  const data = [...csrStats]
    .sort((a, b) => b.qualifiedLeads - a.qualifiedLeads)
    .map(r => ({ name: r.csrName.split(' ')[0], qualified: r.qualifiedLeads, pending: r.pendingLeads, atGoal: r.atGoal }))

  const isEmpty = data.every(d => d.qualified === 0 && d.pending === 0)

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="font-black text-white">Leads by CSR</h3>
        <p className="text-xs text-gray-600 mt-0.5">Qualified (yellow) vs pending (amber) · sorted by qualified</p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-[220px] text-center">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-gray-600 text-sm">No lead data yet</p>
          <p className="text-gray-700 text-xs mt-1">Add leads to populate this chart</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="35%" margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid vertical={false} stroke="#1f2937" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="qualified" name="Qualified" radius={[4,4,0,0]} maxBarSize={30}>
              {data.map((d, i) => <Cell key={i} fill={d.atGoal ? '#22c55e' : '#FFCC00'} fillOpacity={0.9} />)}
              <LabelList dataKey="qualified" position="top" style={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} />
            </Bar>
            <Bar dataKey="pending" name="Pending" radius={[4,4,0,0]} fill="#f59e0b" fillOpacity={0.4} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      )}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
        <Leg color="#FFCC00" label="Qualified" />
        <Leg color="#22c55e" label="At Goal"   />
        <Leg color="#f59e0b" label="Pending"   opacity={0.4} />
      </div>
    </div>
  )
}

function Leg({ color, label, opacity = 1 }: { color: string; label: string; opacity?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color, opacity }} />
      <span>{label}</span>
    </div>
  )
}
