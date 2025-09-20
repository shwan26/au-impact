'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

type Row = {
  announcementid: number;
  topic: string;
  description: string | null;
  photourl: string | null;
  dateposted: string;
  status: 'DRAFT' | 'PENDING' | 'LIVE' | 'COMPLETE' | string;
  sau_id: number | null;
  auso_id: number | null;
};

const LABEL_COL = 'min-w-[210px] pr-4 text-sm font-medium text-zinc-700';

function RowBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[210px_1fr]">
      <div className={LABEL_COL}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default function AUSOAnnouncementEditPage() {
  const params = useParams<{ id: string }>();
  const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
  const idNum = useMemo(() => Number(idStr), [idStr]);

  const [item, setItem] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/announcements/${idNum}`, { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed to load');
        if (!cancelled) setItem(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [idNum]);

  async function setStatus(newStatus: 'LIVE' | 'PENDING') {
    if (!item) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/announcements/${idNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Topic: item.topic,
          Description: item.description,
          PhotoURL: item.photourl,
          Status: newStatus,
          SAU_ID: item.sau_id,
          AUSO_ID: item.auso_id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Update failed');
      setItem(json);
      alert(newStatus === 'LIVE' ? 'Approved (LIVE)' : 'Marked PENDING');
    } catch (e: any) {
      setErr(e?.message || 'Update error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-4">Loading…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!item) return <div className="p-4">Announcement not found.</div>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-extrabold">Announcement</h1>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <RowBox label="Activity Unit">
          <div className="py-1">Student Council of Theodore Maria School of Arts</div>
        </RowBox>

        <RowBox label="Announcement Number">
          <div className="py-1 font-mono">A{String(item.announcementid).padStart(6, '0')}</div>
        </RowBox>

        <RowBox label="Announcement Topic">
          <input
            readOnly
            value={item.topic}
            className="w-full max-w-xl rounded-md border border-zinc-300 px-3 py-2 text-sm bg-zinc-50"
          />
        </RowBox>

        <RowBox label="Description">
          <textarea
            readOnly
            value={item.description ?? ''}
            rows={4}
            className="w-full max-w-xl rounded-md border border-zinc-300 px-3 py-2 text-sm bg-zinc-50"
          />
        </RowBox>

        <RowBox label="Photo URL">
          <input
            readOnly
            value={item.photourl ?? ''}
            className="w-full max-w-xl rounded-md border border-zinc-300 px-3 py-2 text-sm bg-zinc-50"
          />
        </RowBox>

        <RowBox label="Status">
          <input
            readOnly
            value={item.status}
            className="w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-sm bg-zinc-50"
          />
        </RowBox>

        {/* Buttons (approve / not approve) */}
        <RowBox label="Actions">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => setStatus('LIVE')}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Approve (LIVE)'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setStatus('PENDING')}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Not approve (PENDING)'}
            </button>
          </div>
        </RowBox>

        <div className="mt-4 flex items-center gap-3">
          <Link
            href="/auso/announcements"
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Back
          </Link>
        </div>
      </form>
    </main>
  );
}
