'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabaseClient'

export default function LoginForm() {
  const supabase = createClient()
  const router = useRouter()
  const search = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    const fallback = '/public/profile'
    const to = search?.get('redirectedFrom') || fallback
    router.push(to)
  }

  const createHref =
    `/public/create-account${
      search?.get('redirectedFrom') ? `?redirectedFrom=${search.get('redirectedFrom')}` : ''
    }`

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="w-full rounded border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Password</label>
        <input
          type="password"
          className="w-full rounded border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Buttons side-by-side (stack on very small screens) */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-200 px-4 py-2 font-semibold text-zinc-800 hover:bg-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>

        <Link
          href={createHref}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-center font-semibold hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200"
        >
          Create Account
        </Link>
      </div>
    </form>
  )
}
