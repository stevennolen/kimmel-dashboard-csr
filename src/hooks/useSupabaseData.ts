import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Lead, Settings, ContestState, CSRConfig } from '../types'
import { DEFAULT_SETTINGS, DEFAULT_CONTEST } from '../config/defaults'
import { today } from '../utils/calculations'

// ── DB row shapes ─────────────────────────────────────────────────────────────

interface DbLead {
  id: string
  lead_number: string
  date_submitted: string
  csr_id: string
  csr_name: string
  route_number: string
  business_name: string
  contact_name: string
  phone: string
  email: string
  lead_type: string
  competitor: string
  notes: string
  qual_status: string
  sales_owner: string
  follow_up_status: string
  sales_notes: string
  route_visible_update: string
  estimated_value: number
  last_updated: string
}

interface DbCSR {
  id: string
  name: string
  route_number: string
  sort_order: number
}

interface DbAppSetting {
  key: string
  value: unknown
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function rowToLead(row: DbLead): Lead {
  return {
    id:                 row.id,
    leadNumber:         row.lead_number,
    dateSubmitted:      row.date_submitted,
    csrId:              row.csr_id,
    csrName:            row.csr_name,
    routeNumber:        row.route_number,
    businessName:       row.business_name,
    contactName:        row.contact_name,
    phone:              row.phone,
    email:              row.email,
    leadType:           row.lead_type,
    competitor:         row.competitor,
    notes:              row.notes,
    qualStatus:         row.qual_status,
    salesOwner:         row.sales_owner,
    followUpStatus:     row.follow_up_status,
    salesNotes:         row.sales_notes,
    routeVisibleUpdate: row.route_visible_update,
    estimatedValue:     row.estimated_value,
    lastUpdated:        row.last_updated,
  }
}

function leadToRow(lead: Lead): DbLead {
  return {
    id:                   lead.id,
    lead_number:          lead.leadNumber,
    date_submitted:       lead.dateSubmitted,
    csr_id:               lead.csrId,
    csr_name:             lead.csrName,
    route_number:         lead.routeNumber,
    business_name:        lead.businessName,
    contact_name:         lead.contactName,
    phone:                lead.phone,
    email:                lead.email,
    lead_type:            lead.leadType,
    competitor:           lead.competitor,
    notes:                lead.notes,
    qual_status:          lead.qualStatus,
    sales_owner:          lead.salesOwner,
    follow_up_status:     lead.followUpStatus,
    sales_notes:          lead.salesNotes,
    route_visible_update: lead.routeVisibleUpdate,
    estimated_value:      lead.estimatedValue,
    last_updated:         lead.lastUpdated,
  }
}

function buildSettings(
  settingsRow: DbAppSetting | undefined,
  csrs: DbCSR[],
): Settings {
  const saved = (settingsRow?.value ?? {}) as Partial<Settings>
  const csrList: CSRConfig[] = csrs.length > 0
    ? csrs.map(r => ({ id: r.id, name: r.name, routeNumber: r.route_number }))
    : DEFAULT_SETTINGS.csrList
  return { ...DEFAULT_SETTINGS, ...saved, csrList }
}

// ── Realtime helpers ──────────────────────────────────────────────────────────

async function fetchSettingsAndCSRs(): Promise<{
  settings: Settings
  contestState: ContestState
}> {
  const [sRes, cRes] = await Promise.all([
    supabase.from('app_settings').select('*'),
    supabase.from('csrs').select('*').order('sort_order', { ascending: true }),
  ])
  const rows = (sRes.data ?? []) as DbAppSetting[]
  const settingsRow  = rows.find(r => r.key === 'settings')
  const contestRow   = rows.find(r => r.key === 'contest')
  return {
    settings:     buildSettings(settingsRow, (cRes.data ?? []) as DbCSR[]),
    contestState: { ...DEFAULT_CONTEST, ...(contestRow?.value as Partial<ContestState> ?? {}) },
  }
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useSupabaseData() {
  const [settings,      setSettingsState]     = useState<Settings>(DEFAULT_SETTINGS)
  const [leads,         setLeadsState]        = useState<Lead[]>([])
  const [contestState,  setContestStateState] = useState<ContestState>(DEFAULT_CONTEST)
  const [loading,       setLoading]           = useState(true)
  const [error,         setError]             = useState<string | null>(null)

  // ── Initial load + realtime ────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    async function loadAll() {
      try {
        const [sRes, cRes, lRes] = await Promise.all([
          supabase.from('app_settings').select('*'),
          supabase.from('csrs').select('*').order('sort_order', { ascending: true }),
          supabase.from('leads').select('*').order('lead_number', { ascending: true }),
        ])
        if (sRes.error) throw sRes.error
        if (cRes.error) throw cRes.error
        if (lRes.error) throw lRes.error
        if (!mounted) return

        const rows       = sRes.data as DbAppSetting[]
        const settingsRow = rows.find(r => r.key === 'settings')
        const contestRow  = rows.find(r => r.key === 'contest')

        setSettingsState(buildSettings(settingsRow, cRes.data as DbCSR[]))
        setContestStateState({
          ...DEFAULT_CONTEST,
          ...(contestRow?.value as Partial<ContestState> ?? {}),
        })
        setLeadsState((lRes.data as DbLead[]).map(rowToLead))
      } catch (e) {
        console.error('Supabase load error:', e)
        if (mounted) setError(String(e))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadAll()

    // Realtime: leads
    const leadsChannel = supabase
      .channel('leads-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, payload => {
        if (!mounted) return
        if (payload.eventType === 'INSERT') {
          const incoming = rowToLead(payload.new as DbLead)
          setLeadsState(prev =>
            prev.some(l => l.id === incoming.id)
              ? prev
              : [...prev, incoming].sort((a, b) => a.leadNumber.localeCompare(b.leadNumber)),
          )
        } else if (payload.eventType === 'UPDATE') {
          setLeadsState(prev =>
            prev.map(l => l.id === (payload.new as DbLead).id ? rowToLead(payload.new as DbLead) : l),
          )
        } else if (payload.eventType === 'DELETE') {
          setLeadsState(prev => prev.filter(l => l.id !== (payload.old as { id: string }).id))
        }
      })
      .subscribe()

    // Realtime: app_settings + csrs — re-fetch both together
    const refreshSettings = () => {
      fetchSettingsAndCSRs().then(({ settings: s, contestState: c }) => {
        if (!mounted) return
        setSettingsState(s)
        setContestStateState(c)
      }).catch(e => console.error('Realtime settings refresh error:', e))
    }

    const settingsChannel = supabase
      .channel('settings-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, refreshSettings)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'csrs' }, refreshSettings)
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(leadsChannel)
      supabase.removeChannel(settingsChannel)
    }
  }, [])

  // ── Settings ───────────────────────────────────────────────────────────────
  const setSettings = useCallback(async (
    value: Settings | ((prev: Settings) => Settings),
  ) => {
    const next = value instanceof Function ? value(settings) : value
    setSettingsState(next)

    const { csrList, ...rest } = next

    const { error: se } = await supabase
      .from('app_settings')
      .upsert({ key: 'settings', value: rest }, { onConflict: 'key' })
    if (se) console.error('Error saving settings:', se)

    // Delete removed CSRs
    const removedIds = settings.csrList
      .map(c => c.id)
      .filter(id => !csrList.some(c => c.id === id))
    if (removedIds.length > 0) {
      await supabase.from('csrs').delete().in('id', removedIds)
    }

    // Upsert remaining CSRs
    if (csrList.length > 0) {
      const rows: DbCSR[] = csrList.map((c, i) => ({
        id:          c.id,
        name:        c.name,
        route_number: c.routeNumber,
        sort_order:  i,
      }))
      const { error: ce } = await supabase
        .from('csrs')
        .upsert(rows, { onConflict: 'id' })
      if (ce) console.error('Error saving CSRs:', ce)
    }
  }, [settings])

  // ── Contest state ──────────────────────────────────────────────────────────
  const setContestState = useCallback(async (
    value: ContestState | ((prev: ContestState) => ContestState),
  ) => {
    const next = value instanceof Function ? value(contestState) : value
    setContestStateState(next)
    const { error: e } = await supabase
      .from('app_settings')
      .upsert({ key: 'contest', value: next }, { onConflict: 'key' })
    if (e) console.error('Error saving contest state:', e)
  }, [contestState])

  // ── Lead CRUD ──────────────────────────────────────────────────────────────
  const addLead = useCallback(async (lead: Lead) => {
    setLeadsState(prev => [...prev, lead])
    const { error: e } = await supabase.from('leads').insert(leadToRow(lead))
    if (e) console.error('Error inserting lead:', e)
  }, [])

  const updateLead = useCallback(async (updated: Lead) => {
    const withDate = { ...updated, lastUpdated: today() }
    setLeadsState(prev => prev.map(l => l.id === updated.id ? withDate : l))
    const { error: e } = await supabase
      .from('leads')
      .update(leadToRow(withDate))
      .eq('id', updated.id)
    if (e) console.error('Error updating lead:', e)
  }, [])

  const deleteLead = useCallback(async (id: string) => {
    setLeadsState(prev => prev.filter(l => l.id !== id))
    const { error: e } = await supabase.from('leads').delete().eq('id', id)
    if (e) console.error('Error deleting lead:', e)
  }, [])

  const clearLeads = useCallback(async () => {
    setLeadsState([])
    const { error: e } = await supabase.from('leads').delete().neq('id', '')
    if (e) console.error('Error clearing leads:', e)
  }, [])

  return {
    settings,
    setSettings,
    leads,
    contestState,
    setContestState,
    addLead,
    updateLead,
    deleteLead,
    clearLeads,
    loading,
    error,
  }
}
