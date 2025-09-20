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

function RowBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
      <div className="py-2 text-sm font-medium text-zinc-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export default function SAUEditAnnouncementPage() {
  const params = useParams<{ id: string }>();
  const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
  const idNum = useMemo(() => Number(idStr), [idStr]);

  const [item, setItem] = useState<Row | null>(null);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [photourl, setPhotourl] = useState('');
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
        if (!cancelled) {
          setItem(json);
          setTopic(json.topic ?? '');
          setDescription(json.description ?? '');
          setPhotourl(json.photourl ?? '');
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Error loading announcement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [idNum]);

  async function save(newStatus: 'DRAFT' | 'PENDING') {
    if (!item) return;
    try {
      setSaving(true);
      setErr(null);
      const res = await fetch(`/api/announcements/${idNum}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Topic: topic,
          Description: description || null,
          PhotoURL: photourl || null,
          Status: newStatus,               // ✅ matches DB constraint
          SAU_ID: item.sau_id,
          AUSO_ID: item.auso_id,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Update failed');
      setItem(json);
      alert(newStatus === 'PENDING' ? 'Submitted for review.' : 'Saved as draft.');
    } catch (e: any) {
      setErr(e?.message || 'Update error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (err) return <div className="p-6 text-red-600">{err}</div>;
  if (!item) return <div className="p-6">Announcement not found.</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Announcement</h1>
        <Link
          href="/sau/announcements"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
        >
          Back to List
        </Link>
      </div>

      <div className="grid items-start gap-3 md:grid-cols-[220px_1fr]">
        <div className="py-2 text-sm font-medium text-zinc-700">Activity Unit</div>
        <div className="py-2">Student Council of Theodore Maria School of Arts</div>

        <div className="py-2 text-sm font-medium text-zinc-700">Announcement Number</div>
        <div className="py-2 font-mono">A{String(item.announcementid).padStart(6, '0')}</div>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <RowBox label="Announcement Topic">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </RowBox>

        <RowBox label="Description">
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </RowBox>

        <RowBox label="Overview Photo URL">
          <input
            value={photourl}
            onChange={(e) => setPhotourl(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-200"
            placeholder="https://…"
          />
        </RowBox>

        <RowBox label="Status">
          <input
            readOnly
            value={item.status}
            className="w-full max-w-xs rounded-md border border-zinc-300 px-3 py-2 text-sm bg-zinc-50"
          />
        </RowBox>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => save('PENDING')}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-900 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Submit for review (PENDING)'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save('DRAFT')}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save draft (DRAFT)'}
          </button>
        </div>
      </form>
    </div>
  );
}
