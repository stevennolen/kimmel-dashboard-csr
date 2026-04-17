import { useState, useMemo } from 'react'
import { Lead, FilterState, TabId, ContestState, Settings } from './types'
import { DEFAULT_SETTINGS, DEFAULT_CONTEST, DEFAULT_FILTERS } from './config/defaults'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
  getCSRStats, getTeamStats, getDaysRemaining, applyFilters,
  generateLeadNumber, today,
} from './utils/calculations'

import AppHeader      from './components/AppHeader'
import SummaryBar     from './components/SummaryBar'
import FilterBar      from './components/FilterBar'
import CSRLeaderboard from './components/CSRLeaderboard'
import LeadTable      from './components/LeadTable'
import LeadFormModal  from './components/LeadFormModal'
import SalesFeedback  from './components/SalesFeedback'
import GoalTracker    from './components/GoalTracker'
import HotLeads       from './components/HotLeads'
import RecentUpdates  from './components/RecentUpdates'
import SettingsDrawer from './components/SettingsDrawer'
import LeadsByCSRChart  from './components/charts/LeadsByCSRChart'
import LeadStatusPie    from './components/charts/LeadStatusPie'
import SalesFunnelBar   from './components/charts/SalesFunnelBar'
import DailyTrendChart  from './components/charts/DailyTrendChart'

export default function App() {
  // ── Persisted state ─────────────────────────────────────────────────────────
  const [settings,     setSettings]     = useLocalStorage('kimmel_settings', DEFAULT_SETTINGS)
  const [leads,        setLeads]        = useLocalStorage<Lead[]>('kimmel_leads', [])
  const [contestState, setContestState] = useLocalStorage('kimmel_contest', DEFAULT_CONTEST)

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState<TabId>('overview')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [editingLead,  setEditingLead]  = useState<Lead | null>(null)
  const [addingLead,   setAddingLead]   = useState(false)
  const [filters,      setFilters]      = useState<FilterState>(DEFAULT_FILTERS)
  const [filtersOpen,  setFiltersOpen]  = useState(false)

  // ── Derived values ────────────────────────────────────────────────────────────
  const daysRemaining  = getDaysRemaining(settings, contestState)
  const csrStats       = useMemo(() => getCSRStats(settings, leads),         [settings, leads])
  const teamStats      = useMemo(() => getTeamStats(leads, settings, csrStats), [leads, settings, csrStats])
  const filteredLeads  = useMemo(() => applyFilters(leads, filters),         [leads, filters])
  const hasFilters     = useMemo(() =>
    Object.entries(filters).some(([, v]) => typeof v === 'boolean' ? v : v !== ''),
    [filters],
  )

  // ── Lead CRUD ─────────────────────────────────────────────────────────────────
  const handleAddLead = (data: Omit<Lead, 'id' | 'leadNumber' | 'lastUpdated'>) => {
    const newLead: Lead = {
      ...data,
      id:          crypto.randomUUID(),
      leadNumber:  generateLeadNumber(leads),
      lastUpdated: today(),
    }
    setLeads(prev => [...prev, newLead])
    setAddingLead(false)
  }

  const handleUpdateLead = (updated: Lead) => {
    setLeads(prev =>
      prev.map(l => l.id === updated.id ? { ...updated, lastUpdated: today() } : l),
    )
    setEditingLead(null)
  }

  const handleDeleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  // ── Contest control ───────────────────────────────────────────────────────────
  const handleStartContest = () => {
    setContestState({ started: true, startDate: today(), manualDaysLeft: null, paused: false })
  }
  const handlePauseContest = () => {
    setContestState(prev => ({ ...prev, paused: !prev.paused, manualDaysLeft: prev.paused ? null : daysRemaining }))
  }
  const handleResetContest = () => setContestState(DEFAULT_CONTEST)

  const openModal  = addingLead || editingLead !== null

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <AppHeader
        settings={settings}
        contestState={contestState}
        daysRemaining={daysRemaining}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setSettingsOpen(true)}
        onStartContest={handleStartContest}
        onAddLead={() => setAddingLead(true)}
      />

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Summary stats strip — always visible */}
        <div className="pt-5 pb-4">
          <SummaryBar stats={teamStats} daysRemaining={daysRemaining} settings={settings} />
        </div>

        {/* Filters (shared across tabs) */}
        <div className="mb-6">
          <FilterBar
            filters={filters}
            onChange={setFilters}
            settings={settings}
            open={filtersOpen}
            onToggle={() => setFiltersOpen(o => !o)}
            hasActive={hasFilters}
            onClear={() => setFilters(DEFAULT_FILTERS)}
          />
        </div>

        {/* ── Tab: Overview ──────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <OverviewContent
            leads={filteredLeads}
            allLeads={leads}
            csrStats={csrStats}
            teamStats={teamStats}
            contestState={contestState}
            settings={settings}
            onEditLead={setEditingLead}
            onAddLead={() => setAddingLead(true)}
            onStartContest={handleStartContest}
          />
        )}

        {/* ── Tab: Leaderboard ───────────────────────────────────────────── */}
        {activeTab === 'leaderboard' && (
          <CSRLeaderboard csrStats={csrStats} settings={settings} />
        )}

        {/* ── Tab: Leads ─────────────────────────────────────────────────── */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Lead Management</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
                  {hasFilters ? ' (filtered)' : ''}
                </p>
              </div>
              <button className="btn-primary" onClick={() => setAddingLead(true)}>
                + Add Lead
              </button>
            </div>
            <LeadTable
              leads={filteredLeads}
              onEdit={setEditingLead}
              onDelete={handleDeleteLead}
            />
          </div>
        )}

        {/* ── Tab: Sales Feedback ────────────────────────────────────────── */}
        {activeTab === 'feedback' && (
          <SalesFeedback
            leads={filteredLeads}
            onEdit={setEditingLead}
          />
        )}
      </main>

      {/* ── Settings drawer ────────────────────────────────────────────────── */}
      <SettingsDrawer
        open={settingsOpen}
        settings={settings}
        contestState={contestState}
        daysRemaining={daysRemaining}
        onUpdateSettings={setSettings}
        onUpdateContest={setContestState}
        onClose={() => setSettingsOpen(false)}
        onStartContest={handleStartContest}
        onPauseContest={handlePauseContest}
        onResetContest={handleResetContest}
        onClearLeads={() => { if (window.confirm('Delete ALL leads? This cannot be undone.')) setLeads([]) }}
      />

      {/* ── Lead add / edit modal ───────────────────────────────────────────── */}
      {openModal && (
        <LeadFormModal
          lead={editingLead}
          settings={settings}
          leads={leads}
          onSave={editingLead ? handleUpdateLead : handleAddLead as (l: Lead) => void}
          onClose={() => { setEditingLead(null); setAddingLead(false) }}
        />
      )}
    </div>
  )
}

// ── Overview tab contents ─────────────────────────────────────────────────────
function OverviewContent({
  leads, allLeads, csrStats, teamStats, contestState, settings,
  onEditLead, onAddLead, onStartContest,
}: {
  leads: Lead[]
  allLeads: Lead[]
  csrStats: ReturnType<typeof getCSRStats>
  teamStats: ReturnType<typeof getTeamStats>
  contestState: ContestState
  settings: Settings
  onEditLead: (l: Lead) => void
  onAddLead: () => void
  onStartContest: () => void
}) {
  const isEmpty = allLeads.length === 0

  return (
    <div className="space-y-6">
      {/* Welcome / empty CTA */}
      {isEmpty && (
        <div className="card p-10 text-center">
          <div className="w-16 h-16 bg-kimmel-yellow-bg rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
            📋
          </div>
          <h2 className="text-2xl font-black text-white mb-2">
            Welcome to the {settings.contestTitle}
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            No leads have been submitted yet. Click <strong className="text-gray-300">Add Lead</strong> to start
            entering qualified leads, or click <strong className="text-gray-300">Edit Settings</strong> in the header
            to configure the contest first.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button className="btn-primary text-base px-6 py-3" onClick={onAddLead}>
              + Add First Lead
            </button>
            {!contestState.started && (
              <button className="btn-secondary px-6 py-3" onClick={onStartContest}>
                🚀 Start Contest
              </button>
            )}
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LeadsByCSRChart csrStats={csrStats} />
        <LeadStatusPie   leads={leads} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesFunnelBar  teamStats={teamStats} />
        <DailyTrendChart leads={allLeads} contestState={contestState} settings={settings} />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GoalTracker   csrStats={csrStats} settings={settings} />
        <HotLeads      leads={leads} onEdit={onEditLead} />
        <RecentUpdates leads={leads} />
      </div>
    </div>
  )
}
