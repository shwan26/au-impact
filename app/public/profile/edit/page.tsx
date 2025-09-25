// app/public/profile/edit/page.tsx
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createServerClientForRoute, createServerClientForServerComponents } from '@/lib/supabaseServer'

export const metadata = { title: 'Edit Profile' }
export const dynamic = 'force-dynamic'

function toInputDate(value?: string | null) {
  if (!value) return ''
  const dt = new Date(value)
  if (isNaN(dt.getTime())) return ''
  return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

async function getMe() {
  const supabase = await createServerClientForServerComponents()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/public/login?redirectedFrom=/public/profile/edit')

  // Select using the names your app expects (these columns exist lowercased)
  const { data: me, error } = await supabase
    .from('User')
    .select(`
      User_ID,
      fullname,
      auemail,
      yearofstudy,
      faculty,
      nickname,
      nationality,
      phonenumber,
      studentid,
      dateofbirth,
      lineid,
      auth_uid
    `)
    .eq('auth_uid', user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return { user, me }
}

export default async function EditProfilePage() {
  const { user, me } = await getMe()

  async function saveAction(formData: FormData) {
    'use server'
    const supabase = await createServerClientForRoute()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/public/login?redirectedFrom=/public/profile/edit')

    const get = (k: string) => (formData.get(k)?.toString().trim() ?? '')
    const toNull = (s: string) => (s === '' ? null : s)

    // ✅ Use LOWERCASE column names here (matches your actual table)
    const payload = {
      fullname: toNull(get('fullname')),
      yearofstudy: get('yearofstudy') ? Number(get('yearofstudy')) : null,
      faculty: toNull(get('faculty')),
      nickname: toNull(get('nickname')),
      nationality: toNull(get('nationality')),
      phonenumber: toNull(get('phonenumber')),
      studentid: toNull(get('studentid')),
      dateofbirth: toNull(get('dateofbirth')),
      lineid: toNull(get('lineid')),
    }

    const { data, error } = await supabase
      .from('User')
      .update(payload)
      .eq('auth_uid', user.id)
      .select('User_ID')
      .single()

    if (error) throw new Error(`Update failed: ${error.message}`)
    if (!data) throw new Error('Update affected 0 rows (check RLS and auth_uid linkage).')

    revalidatePath('/public/profile')
    redirect('/public/profile')
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Profile</h1>

      <form action={saveAction} className="grid max-w-2xl grid-cols-1 gap-4">
        <Field label="Full name">
          <input name="fullname" defaultValue={me?.fullname ?? ''} className="w-full rounded border px-3 py-2" />
        </Field>

        <Field label="AU Email">
          <input
            name="auemail"
            defaultValue={me?.auemail ?? user.email ?? ''}
            className="w-full rounded border px-3 py-2 bg-gray-50"
            readOnly
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Student ID">
            <input name="studentid" defaultValue={me?.studentid ?? ''} className="w-full rounded border px-3 py-2" />
          </Field>
          <Field label="Faculty">
            <input name="faculty" defaultValue={me?.faculty ?? ''} className="w-full rounded border px-3 py-2" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Year of Study">
            <input
              name="yearofstudy"
              defaultValue={me?.yearofstudy ?? ''}
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full rounded border px-3 py-2"
            />
          </Field>
          <Field label="Nickname">
            <input name="nickname" defaultValue={me?.nickname ?? ''} className="w-full rounded border px-3 py-2" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone">
            <input name="phonenumber" defaultValue={me?.phonenumber ?? ''} className="w-full rounded border px-3 py-2" />
          </Field>
          <Field label="Nationality">
            <input name="nationality" defaultValue={me?.nationality ?? ''} className="w-full rounded border px-3 py-2" />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date of Birth">
            <input
              type="date"
              name="dateofbirth"
              defaultValue={toInputDate(me?.dateofbirth)}
              className="w-full rounded border px-3 py-2"
            />
          </Field>
          <Field label="Line ID">
            <input name="lineid" defaultValue={me?.lineid ?? ''} className="w-full rounded border px-3 py-2" />
          </Field>
        </div>

        <div className="mt-2 flex gap-3">
          <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-white">Save changes</button>
          <a href="/public/profile" className="rounded border px-4 py-2 hover:bg-gray-50">Cancel</a>
        </div>
      </form>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-gray-600">{label}</span>
      {children}
    </label>
  )
}
