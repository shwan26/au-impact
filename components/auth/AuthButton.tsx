'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

type Me = {
  fullname?: string | null
}

function initialsFromName(name?: string | null) {
  if (!name) return '🙂'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  const initials = parts.map(p => p[0]?.toUpperCase() ?? '').join('')
  return initials || '🙂'
}

export default function AuthButton() {
  const supabase = createClient()
  const search = useSearchParams()

  const [email, setEmail] = useState<string | null>(null)
  const [me, setMe] = useState<Me | null>(null)

  // Always call hooks at the top, no conditional returns before this point.
  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!isMounted) return
      setEmail(user?.email ?? null)

      if (user) {
        const { data } = await supabase
          .from('user')            // <-- make sure this is your real lowercase table
          .select('fullname')
          .eq('user_id', user.id)  // <-- your PK/FK to auth.users(id)
          .maybeSingle()
        if (!isMounted) return
        setMe((data as Me) ?? null)
      } else {
        setMe(null)
      }
    }
    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setEmail(session?.user?.email ?? null)
      if (session?.user) {
        supabase
          .from('user')
          .select('fullname')
          .eq('user_id', session.user.id)
          .maybeSingle()
          .then(({ data }) => setMe((data as Me) ?? null))
      } else {
        setMe(null)
      }
    })
    return () => {
      isMounted = false
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  // Derive the label WITHOUT any hook to avoid changing hook order.
  const avatarLabel = initialsFromName(me?.fullname ?? email)

  // Logged out → show Login link (preserve redirectedFrom)
  if (!email) {
    const to = `/public/login${
      search?.get('redirectedFrom')
        ? `?redirectedFrom=${search.get('redirectedFrom')}`
        : ''
    }`
    return (
      <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold hover:bg-white/20">
        <Link href={to}>Log in</Link>
      </div>
    )
  }

  // Logged in → show initials avatar linking to profile
  return (
    <Link
      href="/public/profile"
      aria-label="Open my profile"
      className="inline-flex items-center"
      title={me?.fullname ?? email ?? ''}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-gray-200 text-[11px] font-semibold uppercase ring-1 ring-black/10">
        {avatarLabel}
      </span>
    </Link>
  )
}
