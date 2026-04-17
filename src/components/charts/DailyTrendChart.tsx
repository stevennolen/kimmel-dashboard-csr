import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Lead, ContestState, Settings } from '../../types'
import { getDailyTrend } from '../../utils/calculations'

interface Props { leads: Lead[]; contestState: ContestState; settings: Settings }

function Tip({ active, payload, label }: { active?: boolean; payload?: {value:number;name:string}[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-bold text-white mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className={i === 0 ? 'text-kimmel-yellow' : 'text-blue-400'}>
          {p.name === 'daily' ? 'New' : 'Total'}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function DailyTrendChart({ leads, contestState, settings }: Props) {
  const data = getDailyTrend(leads, contestState, settings)

  return (
    <div className="card p-5">
      <div className="mb-4">
        <h3 className="font-black text-white">Daily Submission Trend</h3>
        <p className="text-xs text-gray-600 mt-0.5">
          {contestState.started ? 'Qualified leads per day since contest start' : 'Start the contest to see the trend chart'}
        </p>
      </div>

      {!contestState.started || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[200px] text-center">
          <p className="text-3xl mb-2">📈</p>
          <p className="text-gray-600 text-sm">
            {!contestState.started ? 'Contest not started yet' : 'No data to display'}
          </p>
          <p className="text-gray-700 text-xs mt-1">
            {!contestState.started ? 'Click "Start Contest" to begin tracking submissions over time' : 'Add qualified leads to see the trend'}
          </p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gYellow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FFCC00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FFCC00" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#1f2937" />
              <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<Tip />} cursor={{ stroke: '#374151' }} />
              <Area type="monotone" dataKey="cumulative" name="cumulative" stroke="#60a5fa" strokeWidth={2} fill="url(#gBlue)" dot={false} strokeOpacity={0.6} />
              <Area type="monotone" dataKey="daily" name="daily" stroke="#FFCC00" strokeWidth={2.5} fill="url(#gYellow)" dot={{ fill: '#FFCC00', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-kimmel-yellow rounded"/><span>Daily</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-blue-400 rounded opacity-60"/><span>Cumulative</span></div>
          </div>
        </>
      )}
    </div>
  )
}
