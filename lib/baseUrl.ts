// lib/baseUrl.ts
export function getBaseUrl() {
    // On Vercel
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
      return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }
    // If you set it yourself (optional)
    if (process.env.NEXT_PUBLIC_SITE_URL) {
      return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
    }
    // Local dev
    return 'http://localhost:3000';
  }
  