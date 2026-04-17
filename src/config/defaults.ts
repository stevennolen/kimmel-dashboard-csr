// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT SETTINGS
// These are the starting values loaded on first run.
// Once a user saves changes in the Settings panel, their values are stored
// in localStorage and these defaults are only used as fallback.
// ─────────────────────────────────────────────────────────────────────────────

import type { Settings, ContestState, FilterState } from '../types'

export const DEFAULT_SETTINGS: Settings = {
  contestTitle: 'Kimmel Lead Contest',
  contestDuration: 14,   // days — edit in Settings panel
  goalPerCSR: 5,
  teamGoal: 50,
  leadPayoutAmount: 10,  // $ per qualified lead
  closePayoutType: 'multiplier',
  closePayoutValue: 2,   // 2× = $20 close bonus when closePayoutType is 'multiplier'

  // ── CSR roster — edit in Settings panel inside the app ─────────────────────
  csrList: [
    { id: 'csr-1',  name: 'Phil',    routeNumber: '101' },
    { id: 'csr-2',  name: 'Derrick', routeNumber: '102' },
    { id: 'csr-3',  name: 'Nick',    routeNumber: '103' },
    { id: 'csr-4',  name: 'Bill',    routeNumber: '104' },
    { id: 'csr-5',  name: 'Kevin',   routeNumber: '105' },
    { id: 'csr-6',  name: 'Scott',   routeNumber: '106' },
    { id: 'csr-7',  name: 'Shay',    routeNumber: '107' },
    { id: 'csr-8',  name: 'Shane',   routeNumber: '108' },
    { id: 'csr-9',  name: 'Doug',    routeNumber: '109' },
    { id: 'csr-10', name: 'Corey',   routeNumber: '110' },
  ],

  // ── Sales reps — edit in Settings panel ─────────────────────────────────────
  salesReps: ['Unassigned'],

  // ── Lead taxonomy — edit in Settings panel ──────────────────────────────────
  leadTypes: [
    'Competitive Truck',
    'New Business Opening',
    'New Construction',
  ],
  qualStatuses: [
    'Pending Review',
    'Qualified',
    'Disqualified',
  ],
  followUpStatuses: [
    'Not Contacted',
    'Contacted',
    'Appointment Set',
    'Proposal Sent',
    'Closed Won',
    'Closed Lost',
  ],
}

export const DEFAULT_CONTEST: ContestState = {
  started: false,
  startDate: null,
  manualDaysLeft: null,
  paused: false,
}

export const DEFAULT_FILTERS: FilterState = {
  search: '',
  csr: '',
  routeNumber: '',
  salesRep: '',
  leadType: '',
  qualStatus: '',
  followUpStatus: '',
  dateFrom: '',
  dateTo: '',
  qualifiedOnly: false,
  closedOnly: false,
}
