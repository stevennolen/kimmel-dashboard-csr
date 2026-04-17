import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { Lead } from '../../types'

interface Props { leads: Lead[] }

const SLICES = [
  { key: 'Qualified',      color: '#FFCC00', label: 'Qualified'    },
  { key: 'Pending Review', color: '#f59e0b', label: 'Pending'      },
  { key: 'Disqualified',   color: '#ef4444', label: 'Disqualified' },
] as const

function Tip({ active, payload }: { active?: boolean; payload?: {name:string;value:number;payload:{color:string}}[] }) {
  if (!active || !payload?.length) return null
  const { name, value, payload: p } = payload[0]
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} /><span className="font-bold text-white">{name}</span></div>
      <p className="text-gray-400 mt-1">{value} lead{value !== 1 ? 's' : ''}</p>
    </div>
  )
}

export default function LeadStatusPie({ leads }: Props) {
  const data = SLICES
    .map(s => ({ name: s.label, value: leads.filter(l => l.qualStatus === s.key).length, color: s.color }))
    .filter(d => d.value > 0)
  const total = leads.length

  return (
    <div className="card p-5">
      <div className="mb-2">
        <h3 className="font-black text-white">Lead Status Breakdown</h3>
        <p className="text-xs text-gray-600 mt-0.5">Qualification distribution · {total} total</p>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center h-[220px] text-center">
          <p className="text-3xl mb-2">🍩</p>
          <p className="text-gray-600 text-sm">No leads yet</p>
          <p className="text-gray-700 text-xs mt-1">Qualification data will appear here</p>
        </div>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {data.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.9} />)}
                </Pie>
                <Tooltip content={<Tip />} />
                <Legend
                  formatter={(v) => <span style={{ color: '#9ca3af', fontSize: 11 }}>{v}</span>}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: 30 }}>
              <div className="text-center">
                <p className="text-3xl font-black text-white">{total}</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wider">leads</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {SLICES.map(s => {
              const count = leads.filter(l => l.qualStatus === s.key).length
              return (
                <div key={s.key} className="bg-gray-800 rounded-xl p-2.5 text-center">
                  <p className="text-xl font-black tabular-nums" style={{ color: s.color }}>{count}</p>
                  <p className="text-[9px] text-gray-600 mt-0.5">{s.label}</p>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
