import { redirect } from 'next/navigation';
import Link from 'next/link'
import { createServerClientForServerComponents } from '@/lib/supabaseServer';
import LogoutButton from '@/components/auth/LogoutButton'

export const metadata = { title: 'My Profile' };
export const revalidate = 0;

function fmtDate(input?: string | null) {
  if (!input) return '—';
  const dt = new Date(input);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString();
}

export default async function ProfilePage() {
  const supabase = await createServerClientForServerComponents(); // ⬅️ await

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/public/login?redirectedFrom=/public/profile');
  }

  const { data: me, error } = await supabase
  .from('User')           // <- lowercase
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
    studentid
  `)
  .maybeSingle();

  // then render using the real keys:
  <dd className="font-medium">{me?.fullname ?? '—'}</dd>

  return (
    <section className="space-y-4">
    <h1 className="text-2xl font-semibold">My Profile</h1>
    <div className="flex gap-2">
          <Link
            href="/public/profile/edit"
            className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Edit account
          </Link>
        </div>

    {error && <p className="text-red-600 text-sm">Failed to load profile: {error.message}</p>}


    {me ? (
    <div className="rounded border bg-white p-4">
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
    <div>
    <dt className="text-gray-500">Full name</dt>
    <dd className="font-medium">{me.fullname}</dd>
    </div>
    <div>
    <dt className="text-gray-500">AU Email</dt>
    <dd className="font-medium">{me.auemail}</dd>
    </div>
    <div>
    <dt className="text-gray-500">Student ID</dt>
    <dd className="font-medium">{me.studentid ?? '—'}</dd>
    </div>
    <div>
    <dt className="text-gray-500">Faculty</dt>
    <dd className="font-medium">{me.faculty ?? '—'}</dd>
    </div>
    <div>
      <dt className="text-gray-500">Year of Study</dt>
    <dd className="font-medium">{me.yearofstudy ?? '—'}</dd>
    </div>
    <div>
    <dt className="text-gray-500">Nickname</dt>
    <dd className="font-medium">{me.nickname ?? '—'}</dd>
    </div>
    <div>
    <dt className="text-gray-500">Phone</dt>
    <dd className="font-medium">{me.phonenumber ?? '—'}</dd>
    </div>
    <div>
    <dt className="text-gray-500">Nationality</dt>
    <dd className="font-medium">{me.nationality ?? '—'}</dd>
    </div>
    <div>
    <dt className="text-gray-500">Date of Birth</dt>
    <dd className="font-medium">{fmtDate(me.dateofbirth)}</dd>
    </div>
    <div>
    <dt className="text-gray-500">LineID</dt>
    <dd className="font-medium">{me.lineid ?? '—'}</dd>
    </div>
    </dl>
    </div>
    ) : (
    <p className="text-gray-600">
    No profile row found yet. Try signing out and back in to refresh the link to your auth user.
    </p>
    )}
    <div className="pt-4">
    <LogoutButton />
    </div>
    </section>
    
  )
}