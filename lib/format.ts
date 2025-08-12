export function money(n: number){ return new Intl.NumberFormat(undefined,{ style:'currency', currency:'THB' }).format(n); }
export function slug(s: string){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
