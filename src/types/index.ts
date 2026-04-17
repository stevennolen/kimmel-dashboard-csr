// ─────────────────────────────────────────────────────────────────────────────
// Core domain types for the Kimmel Lead Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export interface CSRConfig {
  id: string
  name: string
  routeNumber: string
}

export type ClosePayoutType = 'multiplier' | 'fixed'

export interface Settings {
  contestTitle: string
  contestDuration: number        // total contest days
  goalPerCSR: number             // qualified leads to hit goal
  teamGoal: number               // total team-wide goal
  leadPayoutAmount: number       // $ per qualified lead
  closePayoutType: ClosePayoutType
  closePayoutValue: number       // multiplier OR fixed $ per closed deal
  csrList: CSRConfig[]
  salesReps: string[]
  leadTypes: string[]
  qualStatuses: string[]
  followUpStatuses: string[]
}

export interface ContestState {
  started: boolean
  startDate: string | null       // 'YYYY-MM-DD' — when contest was started
  manualDaysLeft: number | null  // override: set this to freeze the counter
  paused: boolean
}

export interface Lead {
  id: string
  leadNumber: string             // e.g. 'KUL-001', auto-generated
  dateSubmitted: string          // 'YYYY-MM-DD'
  csrId: string
  csrName: string
  routeNumber: string
  businessName: string
  contactName: string
  phone: string
  email: string
  leadType: string
  competitor: string
  notes: string
  qualStatus: string
  salesOwner: string
  followUpStatus: string
  salesNotes: string
  routeVisibleUpdate: string     // what the route rep sees
  estimatedValue: number
  lastUpdated: string            // 'YYYY-MM-DD'
}

export interface CSRStats {
  csrId: string
  csrName: string
  routeNumber: string
  totalLeads: number
  qualifiedLeads: number
  pendingLeads: number
  closedWon: number
  leadPayout: number
  closePayout: number
  totalPayout: number
  progressPercent: number
  atGoal: boolean
}

export interface TeamStats {
  totalLeads: number
  qualifiedLeads: number
  pendingLeads: number
  disqualifiedLeads: number
  contacted: number
  appointmentSet: number
  proposalSent: number
  closedWon: number
  closedLost: number
  leadPayout: number
  closePayout: number
  totalPayout: number
  progressPercent: number
  csrsWithLeads: number
  csrsAtGoal: number
}

export interface FilterState {
  search: string
  csr: string
  routeNumber: string
  salesRep: string
  leadType: string
  qualStatus: string
  followUpStatus: string
  dateFrom: string
  dateTo: string
  qualifiedOnly: boolean
  closedOnly: boolean
}

export type TabId = 'overview' | 'leaderboard' | 'leads' | 'feedback'
