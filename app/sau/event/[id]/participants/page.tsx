// app/sau/event/[id]/participants/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useJson } from '@/hooks/useJson';

type RegItem = {
  studentId: string;
  name: string;
  phone: string;
  attended?: boolean;
};
type ApiRegs = { staff: RegItem[]; participants: RegItem[] };

type ApiEvent = {
  EventID?: string | number | null;
  Title?: string | null;
};

function toProjectNumber(rawId?: number | string | null) {
  const digits = String(rawId ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
  return `E${digits}`;
}

/** deterministic fallback data so UI always renders */
function fallbackRegs(id: string): ApiRegs {
  const base = (parseInt(id.replace(/\D/g, ''), 10) || 1) % 3;
  const mk = (n: number): RegItem => ({
    studentId: `66${(n + 1).toString().padStart(6, '0')}`,
    name: `Student ${n + 1}`,
    phone: `08${(10000000 + n * 1357).toString().slice(0, 8)}`,
    attended: n % 2 === 0,
  });
  const staffCount = 2 + base;    // 2–4 rows
  const partCount = 5 + base * 2; // 5–9 rows
  return {
    staff: Array.from({ length: staffCount }, (_, i) => mk(i)),
    participants: Array.from({ length: partCount }, (_, i) => mk(i + 10)),
  };
}

export default function SAUEventParticipantsPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // Load event + registrations from API
  const {
    data: ev,
    error: evError,
    loading: evLoading,
  } = useJson<ApiEvent>(`/api/events/${id}`);

  const {
    data: regData,
    error: regsError,
    loading: regsLoading,
  } = useJson<ApiRegs>(`/api/events/${id}/registrations`);

  // Use API when available; otherwise fallback
  const initialRegs: ApiRegs = useMemo(() => {
    // ✅ accept empty arrays as valid; only fallback if object is missing or malformed
    if (regData && Array.isArray(regData.staff) && Array.isArray(regData.participants)) {
      return regData;
    }
    return fallbackRegs(id);
  }, [regData, id]);

  // Local editable state (kept in sync if API refetches)
  const [staff, setStaff] = useState<RegItem[]>(initialRegs.staff);
  const [participants, setParticipants] = useState<RegItem[]>(initialRegs.participants);

  useEffect(() => {
    setStaff(initialRegs.staff);
    setParticipants(initialRegs.participants);
  }, [initialRegs]);

  const onToggle = (kind: 'staff' | 'participants', idx: number, checked: boolean) => {
    if (kind === 'staff') {
      setStaff((list) => list.map((r, i) => (i === idx ? { ...r, attended: checked } : r)));
    } else {
      setParticipants((list) =>
        list.map((r, i) => (i === idx ? { ...r, attended: checked } : r))
      );
    }
  };

  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  async function onSave() {
    try {
      setSaving(true);
      setSaveErr(null);
      setSaveOk(false);

      const res = await fetch(`/api/events/${id}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // If your API expects a different shape, adjust here:
        body: JSON.stringify({ staff, participants }),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (!res.ok) throw new Error((json as any)?.error || 'Failed to save registrations');

      setSaveOk(true);
    } catch (e: any) {
      setSaveErr(e?.message || 'Error while saving');
    } finally {
      setSaving(false);
    }
  }

  if (evLoading) return <div className="p-6 text-zinc-600">Loading event…</div>;
  if (evError || !ev) return <div className="p-6 text-red-600">Event not found.</div>;

  const eventId = ev.EventID ?? null;
  const eventTitle = (ev.Title ?? '').toString().trim() || 'Untitled';

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold">Participant / Staff list</h1>

      {/* Event header info */}
      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <div>
          <span className="font-medium">Activity Unit</span>
          <div>Student Council of Theodore Maria School of Arts</div>
        </div>
        <div>
          <span className="font-medium">Project Number</span>
          <div>{toProjectNumber(eventId)}</div>
        </div>
        <div>
          <span className="font-medium">Project Name</span>
          <div>{eventTitle}</div>
        </div>
      </div>

      {/* Staff table */}
      <section className="space-y-2" aria-label="Staff list">
        <div className="flex flex-wrap items-baseline gap-4">
          <h2 className="text-lg font-bold">Staff List</h2>
          <div className="text-sm text-zinc-600">
            Current Staff Number:{' '}
            <span className="font-medium text-zinc-900">{staff.length}</span>
          </div>
          {regsLoading && <span className="text-xs text-zinc-500">Loading staff…</span>}
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-zinc-50 text-zinc-800">
              <tr className="border-b border-zinc-300">
                {['No.', 'Name', 'StudentID', 'Phone No.', 'Attended'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2 text-left font-semibold ${
                      i < 4 ? 'border-r border-zinc-300' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((r, i) => (
                <tr key={`${r.studentId}-staff`} className="border-b border-zinc-200 last:border-b-0">
                  <td className="px-3 py-2 border-r border-zinc-200">{i + 1}.</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.name}</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.studentId}</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.phone}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!r.attended}
                        onChange={(e) => onToggle('staff', i, e.target.checked)}
                        aria-label={`Staff ${r.name} attended`}
                      />
                      <span className="sr-only">Attended</span>
                    </label>
                  </td>
                </tr>
              ))}
              {!staff.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                    No staff registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Participant table */}
      <section className="space-y-2" aria-label="Participant list">
        <div className="flex flex-wrap items-baseline gap-4">
          <h2 className="text-lg font-bold">Participant List</h2>
          <div className="text-sm text-zinc-600">
            Current Participant Number:{' '}
            <span className="font-medium text-zinc-900">{participants.length}</span>
          </div>
          {regsLoading && <span className="text-xs text-zinc-500">Loading participants…</span>}
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-zinc-50 text-zinc-800">
              <tr className="border-b border-zinc-300">
                {['No.', 'Name', 'StudentID', 'Phone No.', 'Attended'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2 text-left font-semibold ${
                      i < 4 ? 'border-r border-zinc-300' : ''
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((r, i) => (
                <tr key={`${r.studentId}-participant`} className="border-b border-zinc-200 last:border-b-0">
                  <td className="px-3 py-2 border-r border-zinc-200">{i + 1}.</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.name}</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.studentId}</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.phone}</td>
                  <td className="px-3 py-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!r.attended}
                        onChange={(e) => onToggle('participants', i, e.target.checked)}
                        aria-label={`Participant ${r.name} attended`}
                      />
                      <span className="sr-only">Attended</span>
                    </label>
                  </td>
                </tr>
              ))}
              {!participants.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                    No participants registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="pt-2 space-y-3">
        <button
          onClick={onSave}
          disabled={saving}
          aria-busy={saving}
          className="rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>

        <div aria-live="polite">
          {saveOk && (
            <div className="mt-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
              Attendance saved.
            </div>
          )}
        </div>

        {(regsError || saveErr) && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
            {regsError
              ? (
                <>
                  Couldn’t fetch from <code>/api/events/{id}/registrations</code>. Showing fallback data.
                </>
              )
              : null}
            {saveErr ? <div className="text-red-700 mt-1">Save error: {saveErr}</div> : null}
          </div>
        )}
      </div>
    </div>
  );
}