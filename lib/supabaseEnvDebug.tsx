'use client';

import { useEffect } from 'react';

export default function SupabaseEnvDebug() {
  useEffect(() => {
    console.log('SB URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      'SB KEY:',
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').slice(0, 10) + '…'
    );
  }, []);

  return null; // nothing visible on screen
}
