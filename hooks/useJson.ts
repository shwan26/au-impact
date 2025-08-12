'use client';
import { useEffect, useState } from 'react';

export function useJson<T = any>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    setLoading(true);
    fetch(url, { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error('Failed to fetch'))))
      .then(j => { if (on) { setData(j); setError(null); } })
      .catch(e => on && setError(e))
      .finally(() => on && setLoading(false));
    return () => { on = false; };
  }, [url]);

  return { data, error, loading };
}
