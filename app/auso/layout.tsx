// src/app/auso/layout.tsx
import AusoNavbar from '@/components/AusoNavbar';

export default function AusoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AusoNavbar />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
