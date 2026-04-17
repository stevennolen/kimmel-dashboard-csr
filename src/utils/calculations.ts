import type {
  Settings, ContestState, Lead, CSRStats, TeamStats, FilterState,
} from '../types'

// ── Payout helpers ─────────────────────────────────────────────────────────────

/** Additional bonus earned per closed-won deal. */
export function getClosePayout(s: Settings): number {
  return s.closePayoutType === 'multiplier'
    ? s.leadPayoutAmount * s.closePayoutValue
    : s.closePayoutValue
}

/** Human-readable description of the close payout formula. */
export function closePayoutLabel(s: Settings): string {
  if (s.closePayoutType === 'multiplier') {
    return `${s.closePayoutValue}× lead payout ($${s.leadPayoutAmount * s.closePayoutValue} per close)`
  }
  return `$${s.closePayoutValue} flat bonus per close`
}

// ── Contest countdown ─────────────────────────────────────────────────────────

/**
 * Returns days remaining using this priority order:
 * 1. Manual override (manualDaysLeft) — always wins
 * 2. If not started → show full contestDuration as default
 * 3. If started → calculate from startDate
 */
export function getDaysRemaining(s: Settings, c: ContestState): number {
  if (c.manualDaysLeft !== null) return Math.max(0, c.manualDaysLeft)
  if (!c.started || !c.startDate) return s.contestDuration
  const start = new Date(c.startDate + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const elapsed = Math.floor((today.getTime() - start.getTime()) / 86_400_000)
  return Math.max(0, s.contestDuration - elapsed)
}

// ── Per-CSR statistics ────────────────────────────────────────────────────────

export function getCSRStats(s: Settings, leads: Lead[]): CSRStats[] {
  return s.csrList.map(csr => {
    const cl   = leads.filter(l => l.csrId === csr.id)
    const qual  = cl.filter(l => l.qualStatus === 'Qualified')
    const pend  = cl.filter(l => l.qualStatus === 'Pending Review')
    const won   = qual.filter(l => l.followUpStatus === 'Closed Won')

    const lp = qual.length * s.leadPayoutAmount
    const cp = won.length  * getClosePayout(s)

    return {
      csrId:           csr.id,
      csrName:         csr.name,
      routeNumber:     csr.routeNumber,
      totalLeads:      cl.length,
      qualifiedLeads:  qual.length,
      pendingLeads:    pend.length,
      closedWon:       won.length,
      leadPayout:      lp,
      closePayout:     cp,
      totalPayout:     lp + cp,
      progressPercent: s.goalPerCSR > 0
        ? Math.min((qual.length / s.goalPerCSR) * 100, 100)
        : 0,
      atGoal: qual.length >= s.goalPerCSR,
    }
  })
}

// ── Team totals ───────────────────────────────────────────────────────────────

export function getTeamStats(
  leads: Lead[],
  s: Settings,
  csrStats?: CSRStats[],
): TeamStats {
  const stats = csrStats ?? getCSRStats(s, leads)

  const qual  = leads.filter(l => l.qualStatus === 'Qualified')
  const pend  = leads.filter(l => l.qualStatus === 'Pending Review')
  const disq  = leads.filter(l => l.qualStatus === 'Disqualified')
  const won   = leads.filter(l => l.followUpStatus === 'Closed Won')
  const lost  = leads.filter(l => l.followUpStatus === 'Closed Lost')
  const contacted = leads.filter(l =>
    ['Contacted','Appointment Set','Proposal Sent','Closed Won','Closed Lost']
      .includes(l.followUpStatus),
  )
  const appt  = leads.filter(l => l.followUpStatus === 'Appointment Set')
  const prop  = leads.filter(l => l.followUpStatus === 'Proposal Sent')

  const lp = qual.length * s.leadPayoutAmount
  const cp = won.length  * getClosePayout(s)

  return {
    totalLeads:        leads.length,
    qualifiedLeads:    qual.length,
    pendingLeads:      pend.length,
    disqualifiedLeads: disq.length,
    contacted:         contacted.length,
    appointmentSet:    appt.length,
    proposalSent:      prop.length,
    closedWon:         won.length,
    closedLost:        lost.length,
    leadPayout:        lp,
    closePayout:       cp,
    totalPayout:       lp + cp,
    progressPercent:   s.teamGoal > 0
      ? Math.min((qual.length / s.teamGoal) * 100, 100)
      : 0,
    csrsWithLeads: stats.filter(r => r.qualifiedLeads > 0).length,
    csrsAtGoal:    stats.filter(r => r.atGoal).length,
  }
}

// ── Filters ───────────────────────────────────────────────────────────────────

export function applyFilters(leads: Lead[], f: FilterState): Lead[] {
  const q = f.search.toLowerCase()
  return leads.filter(l => {
    if (q && ![l.businessName, l.contactName, l.csrName, l.leadNumber]
      .some(v => v.toLowerCase().includes(q))) return false
    if (f.csr            && l.csrId          !== f.csr)            return false
    if (f.routeNumber    && l.routeNumber    !== f.routeNumber)    return false
    if (f.salesRep       && l.salesOwner     !== f.salesRep)       return false
    if (f.leadType       && l.leadType       !== f.leadType)       return false
    if (f.qualStatus     && l.qualStatus     !== f.qualStatus)     return false
    if (f.followUpStatus && l.followUpStatus !== f.followUpStatus) return false
    if (f.dateFrom       && l.dateSubmitted  <  f.dateFrom)        return false
    if (f.dateTo         && l.dateSubmitted  >  f.dateTo)          return false
    if (f.qualifiedOnly  && l.qualStatus     !== 'Qualified')      return false
    if (f.closedOnly     && l.followUpStatus !== 'Closed Won')     return false
    return true
  })
}

// ── Utilities ─────────────────────────────────────────────────────────────────

export function generateLeadNumber(leads: Lead[]): string {
  const nums = leads.map(l => {
    const m = l.leadNumber.match(/(\d+)$/)
    return m ? parseInt(m[1], 10) : 0
  })
  const max = nums.length ? Math.max(...nums) : 0
  return `KUL-${String(max + 1).padStart(3, '0')}`
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function fmt$(n: number): string {
  return '$' + n.toLocaleString('en-US')
}

/** Build daily trend data for the area chart. */
export function getDailyTrend(leads: Lead[], c: ContestState, s: Settings) {
  if (!c.started || !c.startDate) return []
  const start = new Date(c.startDate + 'T12:00:00')
  const now   = new Date(); now.setHours(23, 59, 59, 999)
  const counts: Record<string, number> = {}
  for (let d = new Date(start); d <= now; d.setDate(d.getDate() + 1)) {
    const k = d.toISOString().slice(0, 10)
    counts[k] = 0
  }
  leads.filter(l => l.qualStatus === 'Qualified').forEach(l => {
    if (l.dateSubmitted in counts) counts[l.dateSubmitted]++
  })
  let cum = 0
  return Object.entries(counts).map(([date, daily]) => {
    cum += daily
    const lbl = new Date(date + 'T12:00:00')
      .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { date, label: lbl, daily, cumulative: cum }
  })
}

/** Export leads array as a downloadable CSV file. Cross-platform (Blob API). */
export function exportLeadsCSV(leads: Lead[]): void {
  const headers = [
    'Lead #','Date','CSR','Route','Business','Contact','Phone','Email',
    'Type','Competitor','Notes','Qual Status','Sales Owner','Follow-Up Status',
    'Sales Notes','Route Update','Est. Value','Last Updated',
  ]
  const rows = leads.map(l => [
    l.leadNumber, l.dateSubmitted, l.csrName, l.routeNumber, l.businessName,
    l.contactName, l.phone, l.email, l.leadType, l.competitor, l.notes,
    l.qualStatus, l.salesOwner, l.followUpStatus, l.salesNotes,
    l.routeVisibleUpdate, l.estimatedValue, l.lastUpdated,
  ])
  const csv = [headers, ...rows]
    .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'kimmel-leads.csv'; a.click()
  URL.revokeObjectURL(url)
}
