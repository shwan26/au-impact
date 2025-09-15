'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useJson } from '@/hooks/useJson';
import { getEventById } from '@/lib/mock';
import type { Event } from '@/types/db';

type RegItem = {
  studentId: string;
  name: string;
  phone: string;
  attended?: boolean;
};
type ApiShape = { staff: RegItem[]; participants: RegItem[] };

function toProjectNumber(e: Event) {
  const digits = String(e.id ?? '').replace(/\D/g, '').padStart(6, '0') || '000000';
  return `E${digits}`;
}

/** deterministic fallback data so UI always renders */
function fallbackRegs(id: string, evTitle: string): ApiShape {
  // Make a stable size based on id
  const base = (parseInt(id.replace(/\D/g, ''), 10) || 1) % 3;
  const mk = (n: number): RegItem => ({
    studentId: `66${(n + 1).toString().padStart(6, '0')}`,
    name: `Student ${n + 1}`,
    phone: `08${(10000000 + n * 1357).toString().slice(0, 8)}`,
    attended: n % 2 === 0,
  });
  const staffCount = 2 + base;          // 2–4 rows
  const partCount = 5 + base * 2;       // 5–9 rows
  return {
    staff: Array.from({ length: staffCount }, (_, i) => mk(i)),
    participants: Array.from({ length: partCount }, (_, i) => mk(i + 10)),
  };
}

export default function SAUEventParticipantsPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const ev = getEventById(id);
  if (!ev) return <div className="p-6">Event not found.</div>;

  // Try API; if missing, we’ll use fallback below
  const { data, error } = useJson<ApiShape>(`/api/events/${id}/registrations`);

  const regs: ApiShape = useMemo(() => {
    if (data?.staff || data?.participants) return data as ApiShape;
    return fallbackRegs(id, ev.title);
  }, [data, id, ev.title]);

  const [staff, setStaff] = useState<RegItem[]>(regs.staff);
  const [participants, setParticipants] = useState<RegItem[]>(regs.participants);

  const onToggle = (
    kind: 'staff' | 'participants',
    idx: number,
    checked: boolean
  ) => {
    if (kind === 'staff') {
      setStaff((list) => list.map((r, i) => (i === idx ? { ...r, attended: checked } : r)));
    } else {
      setParticipants((list) =>
        list.map((r, i) => (i === idx ? { ...r, attended: checked } : r))
      );
    }
  };

  const onSave = () => {
    // Wire this to your POST endpoint if/when you add one
    alert(
      `Saved attendance (demo)\n` +
        `Staff: ${staff.filter((s) => s.attended).length}/${staff.length}\n` +
        `Participants: ${participants.filter((p) => p.attended).length}/${participants.length}`
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold">Participant / Staff list</h1>

      {/* Event header info */}
      <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
        <div><span className="font-medium">Activity Unit</span><div>Student Council of Theodore Maria School of Arts</div></div>
        <div><span className="font-medium">Project Number</span><div>{toProjectNumber(ev)}</div></div>
        <div><span className="font-medium">Project Name</span><div>{ev.title}</div></div>
      </div>

      {/* Staff table */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-4">
          <h2 className="text-lg font-bold">Staff List</h2>
          <div className="text-sm text-zinc-600">
            Current Staff Number: <span className="font-medium text-zinc-900">{staff.length}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-zinc-50 text-zinc-800">
              <tr className="border-b border-zinc-300">
                {['No.', 'Name', 'StudentID', 'Phone No.', 'Attended'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2 text-left font-semibold ${i < 4 ? 'border-r border-zinc-300' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((r, i) => (
                <tr key={r.studentId} className="border-b border-zinc-200 last:border-b-0">
                  <td className="px-3 py-2 border-r border-zinc-200">{i + 1}.</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.name}</td>        {/* Name moved here */}
                  <td className="px-3 py-2 border-r border-zinc-200">{r.studentId}</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.phone}</td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!r.attended}
                      onChange={(e) => onToggle('staff', i, e.target.checked)}
                    />
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
      <section className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-4">
          <h2 className="text-lg font-bold">Participant List</h2>
          <div className="text-sm text-zinc-600">
            Current Participant Number:{' '}
            <span className="font-medium text-zinc-900">{participants.length}</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-300 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-zinc-50 text-zinc-800">
              <tr className="border-b border-zinc-300">
                {['No.', 'Name', 'StudentID', 'Phone No.', 'Attended'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2 text-left font-semibold ${i < 4 ? 'border-r border-zinc-300' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((r, i) => (
                <tr key={r.studentId} className="border-b border-zinc-200 last:border-b-0">
                  <td className="px-3 py-2 border-r border-zinc-200">{i + 1}.</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.name}</td>        {/* Name moved here */}
                  <td className="px-3 py-2 border-r border-zinc-200">{r.studentId}</td>
                  <td className="px-3 py-2 border-r border-zinc-200">{r.phone}</td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={!!r.attended}
                      onChange={(e) => onToggle('participants', i, e.target.checked)}
                    />
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

      <div className="pt-2">
        <button
          onClick={onSave}
          className="rounded-md bg-zinc-200 px-6 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-300"
        >
          Save
        </button>
        {error && (
          <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
            Couldn’t fetch from <code>/api/events/{id}/registrations</code>. Showing fallback data.
          </div>
        )}
      </div>
    </div>
  );
}
