// lib/status.ts
export function effectiveStatus(
  status: string | null | undefined,
  endISO?: string | null
): 'PENDING' | 'DRAFT' | 'LIVE' | 'APPROVED' | 'REJECTED' | 'COMPLETE' | 'CANCELLED' | 'ENDED' | 'UNKNOWN' {
  const st = String(status || 'PENDING').toUpperCase() as any;

  if (st === 'LIVE' && endISO) {
    const end = new Date(endISO);
    if (!Number.isNaN(end.getTime()) && end < new Date()) {
      return 'COMPLETE';
    }
  }

  const allowed = new Set([
    'PENDING','DRAFT','LIVE','APPROVED','REJECTED','COMPLETE','CANCELLED','ENDED'
  ]);
  return allowed.has(st) ? st : 'UNKNOWN';
}
