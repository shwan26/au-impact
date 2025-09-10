'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'


export default function AuthButton() {
const [userEmail, setUserEmail] = useState<string | null>(null)
const router = useRouter()
const supabase = createClient()
const search = useSearchParams()


useEffect(() => {
const init = async () => {
const {
data: { user }
} = await supabase.auth.getUser()
setUserEmail(user?.email ?? null)
}
init()


const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
setUserEmail(session?.user?.email ?? null)
})
return () => sub.subscription.unsubscribe()
}, [supabase])


if (!userEmail)
  return (
<div className="flex gap-3 text-sm">
<Link href={`/public/login${search?.get('redirectedFrom') ? `?redirectedFrom=${search.get('redirectedFrom')}` : ''}`}>Log in</Link>

</div>
)


return (
<div className="flex items-center gap-3 text-sm">
<span className="text-gray-600 hidden sm:inline">{userEmail}</span>
<button
onClick={async () => {
await supabase.auth.signOut()
router.refresh()
}}
className="rounded bg-gray-900 px-3 py-1.5 text-white"
>
Sign out
</button>
</div>
)
}