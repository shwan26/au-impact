'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAnnouncementById } from '@/lib/mock';
import type { Announcement } from '@/types/db';

const LABEL_COL = 'min-w-[210px] pr-4 text-sm font-medium text-zinc-700';

function toAnnouncementNumber(id: string) {
  const digits = id.replace(/\D/g, '').padStart(6, '0') || '000000';
  return `A${digits}`;
}

export default function AUSOAnnouncementEditPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { id } = params;

  const a = getAnnouncementById(id) as Announcement | undefined;
  if (!a) return <div className="p-4">Announcement not found.</div>;

  const approve = () => alert('Announcement approved (demo).');
  const reject = () => alert('Announcement not approved (demo).');

  const onSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Announcement saved (demo).');
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Announcements</h1>

      <form onSubmit={onSave} className="space-y-4">
        <Row label="Activity Unit">
          <div className="py-1">Student Council of Theodore Maria School of Arts</div>
        </Row>

        <Row label="Announcement Number">
          <div className="py-1 font-mono">{toAnnouncementNumber(a.id)}</div>
        </Row>

        <Row label="Announcement Topic">
          <input
            defaultValue={a.topic}
            className="w-full max-w-xl rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Description">
          <textarea
            defaultValue={a.description}
            rows={4}
            className="w-full max-w-xl rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </Row>

        <Row label="Photo">
          {a.photoUrl ? (
            <Image
              src={a.photoUrl}
              alt={a.topic}
              width={300}
              height={170}
              className="rounded-md border object-cover"
            />
          ) : (
            <div className="flex h-[170px] w-[300px] items-center justify-center rounded-md border border-zinc-300 bg-zinc-100 text-xs text-zinc-500">
              No image
            </div>
          )}
        </Row>

        {/* Status (Approve / Not approve) */}
        <Row label="Status">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={approve}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/30"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={reject}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Not approve
            </button>
          </div>
        </Row>

        {/* Bottom buttons */}
        <div className="mt-4 flex items-center gap-3">
          <Link
            href="/auso/announcements"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Back
          </Link>
          <button
            type="submit"
            className="rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300"
          >
            Save
          </button>
        </div>
      </form>
    </main>
  );
}

/* helpers */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className={LABEL_COL}>{label}</div>
      <div>{children}</div>
    </div>
  );
}
