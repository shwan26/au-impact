export function money(n: number){ return new Intl.NumberFormat(undefined,{ style:'currency', currency:'THB' }).format(n); }
export function slug(s: string){ 
    return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); 
}

// Always the same on server & client (fixed locale + UTC)
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(iso));
}

