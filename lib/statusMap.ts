// lib/statusMap.ts
import type { Status } from '@/types/db';

/**
 * Map DB status (Supabase enum: PENDING | APPROVED | SOLD_OUT)
 * to frontend app status (db.ts: PENDING | LIVE | COMPLETE)
 */
export function mapDbStatusToApp(s: string): Status {
  switch (s) {
    case 'APPROVED':
      return 'LIVE';
    case 'SOLD_OUT':
      return 'COMPLETE';
    case 'PENDING':
    default:
      return 'PENDING';
  }
}

/**
 * Map frontend app status (db.ts) back to DB status
 */
export function mapAppStatusToDb(s: Status): 'PENDING' | 'APPROVED' | 'SOLD_OUT' {
  switch (s) {
    case 'LIVE':
      return 'APPROVED';
    case 'COMPLETE':
      return 'SOLD_OUT';
    case 'PENDING':
    default:
      return 'PENDING';
  }
}
