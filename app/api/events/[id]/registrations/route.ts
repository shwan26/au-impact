import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TABLE = 'event_attendance';

// Shape sent back to UI
type RegItem = { studentId: string; name: string; phone: string; attended?: boolean };

// GET /api/events/[id]/registrations
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from(TABLE)
      .select('eventid, role, studentid, name, phone, attended')
      .eq('eventid', id);

    if (error) {
      console.error('GET registrations error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const staff: RegItem[] = [];
    const participants: RegItem[] = [];
    (data ?? []).forEach((r: any) => {
      const item: RegItem = {
        studentId: r.studentid,
        name: r.name,
        phone: r.phone,
        attended: !!r.attended,
      };
      if (String(r.role).toUpperCase() === 'STAFF') staff.push(item);
      else participants.push(item);
    });

    return NextResponse.json({ staff, participants });
  } catch (e: any) {
    console.error('GET registrations exception:', e?.message);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

// POST /api/events/[id]/registrations
// Two modes:
// 1) Public submit one registration: { role, FullName, Phone, StudentID, ... }
// 2) SAU save attendance: { staff: RegItem[], participants: RegItem[] }
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const eventId = Number(id);
    if (!Number.isFinite(eventId)) {
      return NextResponse.json({ error: 'Invalid event id' }, { status: 400 });
    }

    const supabase = getSupabaseServer();
    const body = await req.json().catch(() => ({}));

    // -------- Mode 2: bulk save from SAU attendance UI (keep upsert) --------
    if (Array.isArray(body.staff) || Array.isArray(body.participants)) {
      const rows: any[] = [];
      const push = (arr: any[], role: 'STAFF' | 'PARTICIPANT') => {
        (arr || []).forEach((r: any) => {
          if (!r?.studentId) return;
          rows.push({
            eventid: eventId,
            role,
            studentid: String(r.studentId),
            name: String(r.name || '').trim() || 'Unknown',
            phone: String(r.phone || '').trim() || '',
            attended: !!r.attended,
          });
        });
      };
      push(body.staff, 'STAFF');
      push(body.participants, 'PARTICIPANT');

      if (!rows.length) return NextResponse.json({ ok: true });

      const { error } = await supabase
        .from(TABLE)
        .upsert(rows, { onConflict: 'eventid,role,studentid' });

      if (error) {
        console.error('POST registrations upsert error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ ok: true });
    }

    // -------- Mode 1: single public submission (insert only, idempotent) -----
    const role = String(body.role || '').toUpperCase();
    const fullName = String(body.FullName || body.name || '').trim();
    const phone = String(body.Phone || body.phone || '').trim();
    const studentId = String(body.StudentID || body.studentId || '').trim();

    if (!role || !['STAFF', 'PARTICIPANT'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    if (!fullName || !phone || !studentId) {
      return NextResponse.json(
        { error: 'FullName, Phone, and StudentID are required.' },
        { status: 400 }
      );
    }

    const raw = { ...body };

    // Use INSERT (not UPSERT). If duplicate, treat as success.
    const { error } = await supabase.from(TABLE).insert([
      {
        eventid: eventId,
        role,
        studentid: studentId,
        name: fullName,
        phone,
        attended: false,
        raw,
      },
    ]);

    if (error) {
      // 23505 = unique_violation (already registered) — consider "ok"
      if ((error as any).code === '23505') {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      console.error('POST registrations insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('POST /registrations exception:', e?.message);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}