// app/api/uploads/[kind]/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const POSTER_BUCKET = process.env.NEXT_PUBLIC_POSTER_BUCKET ?? 'posters'
const QR_BUCKET     = process.env.NEXT_PUBLIC_QR_BUCKET ?? 'qr'
const SLIP_BUCKET   = process.env.NEXT_PUBLIC_SLIP_BUCKET ?? 'slips'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

function admin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
    global: { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  })
}

function bucketFor(kind: string) {
  return kind === 'poster' ? POSTER_BUCKET
       : kind === 'qr'     ? QR_BUCKET
       : kind === 'slip'   ? SLIP_BUCKET
       : null
}

function normalize(name: string) { return name.replace(/[^a-zA-Z0-9._-]+/g, '-') }

export async function POST(req: Request, ctx: { params: Promise<{ kind: string }> }) {
  try {
    const { kind } = await ctx.params
    const bucket = bucketFor(kind)
    if (!bucket) return NextResponse.json({ error: `Unknown kind "${kind}"` }, { status: 400 })

    const form = await req.formData().catch(() => null)
    if (!form) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'file is required' }, { status: 400 })

    const prefix = String(form.get('prefix') ?? '').trim().replace(/^\/+|\/+$/g, '')
    const path = [prefix, `${Date.now()}-${Math.random().toString(36).slice(2,8)}-${normalize(file.name || 'upload.bin')}`]
      .filter(Boolean).join('/')

    const supabase = admin()
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })
    if (upErr) return NextResponse.json({ error: `upload: ${upErr.message}` }, { status: 500 })

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
    return NextResponse.json({ bucket, path, publicUrl, name: file.name, size: file.size, mime: file.type || 'application/octet-stream' })
  } catch (e: any) {
    console.error('UPLOAD ROUTE ERROR:', e)
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}
