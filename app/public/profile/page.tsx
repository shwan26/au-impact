import { redirect } from 'next/navigation';
import { createServerClientForServerComponents } from '@/lib/supabaseServer'


export const metadata = { title: 'My Profile' }
// Always fetch fresh session + profile on each request
export const revalidate = 0


function fmtDate(input?: string | null) {
if (!input) return '—'
const dt = new Date(input)
return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString()
}


export default async function ProfilePage() {
const supabase = createServerClientForServerComponents()


const {
data: { user },
} = await supabase.auth.getUser()


if (!user) {
redirect('/public/login?redirectedFrom=/public/profile')
}


const { data: me, error } = await supabase
.from('User')
.select(
[
'User_ID',
'FullName',
'AUEmail',
'YearOfStudy',
'Faculty',
'NickName',
'Nationality',
'PhoneNumber',
'StudentID',
'DateOfBirth',
].join(', ')
)
.maybeSingle()


return (
<section className="space-y-4">
<h1 className="text-2xl font-semibold">My Profile</h1>


{error && <p className="text-red-600 text-sm">Failed to load profile: {error.message}</p>}


{me ? (
<div className="rounded border bg-white p-4">
<dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
<div>
<dt className="text-gray-500">Full name</dt>
<dd className="font-medium">{me.FullName}</dd>
</div>
<div>
<dt className="text-gray-500">AU Email</dt>
<dd className="font-medium">{me.AUEmail}</dd>
</div>
<div>
<dt className="text-gray-500">Student ID</dt>
<dd className="font-medium">{me.StudentID ?? '—'}</dd>
</div>
<div>
<dt className="text-gray-500">Faculty</dt>
<dd className="font-medium">{me.Faculty ?? '—'}</dd>
</div>
<div>
  <dt className="text-gray-500">Year of Study</dt>
<dd className="font-medium">{me.YearOfStudy ?? '—'}</dd>
</div>
<div>
<dt className="text-gray-500">Nickname</dt>
<dd className="font-medium">{me.NickName ?? '—'}</dd>
</div>
<div>
<dt className="text-gray-500">Phone</dt>
<dd className="font-medium">{me.PhoneNumber ?? '—'}</dd>
</div>
<div>
<dt className="text-gray-500">Nationality</dt>
<dd className="font-medium">{me.Nationality ?? '—'}</dd>
</div>
<div>
<dt className="text-gray-500">Date of Birth</dt>
<dd className="font-medium">{fmtDate(me.DateOfBirth)}</dd>
</div>
</dl>
</div>
) : (
<p className="text-gray-600">
No profile row found yet. Try signing out and back in to refresh the link to your auth user.
</p>
)}
</section>
)
}