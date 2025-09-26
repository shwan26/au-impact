// lib/status.ts
/**
 * Returns a "visual" status for display.
 * If an event is LIVE but already ended, we show COMPLETE.
 * (Does not modify the database.)
 */
export function effectiveStatus(
    status: string | null | undefined,
    endISO?: string | null
  ): 'PENDING' | 'DRAFT' | 'LIVE' | 'APPROVED' | 'REJECTED' | 'COMPLETE' | 'CANCELLED' | 'UNKNOWN' {
    const st = String(status || 'PENDING').toUpperCase() as any;
  
    if (st === 'LIVE' && endISO) {
      const end = new Date(endISO);
      if (!Number.isNaN(end.getTime()) && end < new Date()) {
        return 'COMPLETE';
      }
    }
  
    const allowed = new Set([
      'PENDING', 'DRAFT', 'LIVE', 'APPROVED', 'REJECTED', 'COMPLETE', 'CANCELLED'
    ]);
    return allowed.has(st) ? st : 'UNKNOWN';
  }
  
