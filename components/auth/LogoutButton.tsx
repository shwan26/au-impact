'use client'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()
  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut()
        router.replace('/public/login')
        router.refresh()
      }}
      className="rounded bg-gray-900 px-3 py-1.5 text-white"
    >
      Sign out
    </button>
  )
}
