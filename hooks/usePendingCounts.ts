// hooks/usePendingCounts.ts
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Role = 'AUSO' | 'SAU'

type Counts = {
  announcements: number
  events: number
  fundraising: number
  total: number
}

export function usePendingCounts(role: Role = 'AUSO', sauOrgId?: string) {
  const [counts, setCounts] = useState<Counts>({
    announcements: 0,
    events: 0,
    fundraising: 0,
    total: 0,
  })

  // fetch counts from the MATERIALIZED VIEW-like SELECT (regular view)
  const load = async () => {
    // We read directly from public.v_pending_counts (GRANT SELECT done in SQL)
    const { data, error } = await supabase
      .from('v_pending_counts')
      .select('*')
      .single()

    if (error) {
      console.error('[pending counts] fetch error:', error)
      return
    }

    if (data) {
      // data = { announcements, events, fundraising, total }
      // console.log('[pending counts] data:', data)
      setCounts({
        announcements: Number(data.announcements ?? 0),
        events: Number(data.events ?? 0),
        fundraising: Number(data.fundraising ?? 0),
        total: Number(data.total ?? 0),
      })
    }
  }

  useEffect(() => {
    load()
    // realtime refresh when rows change
    const channel = supabase
      .channel('pending-counters')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcement' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fundraising' }, load)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [role, sauOrgId])

  return counts
}
