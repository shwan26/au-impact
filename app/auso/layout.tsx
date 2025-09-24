// app/auso/layout.tsx
import AUSONav from '@/components/nav/AUSONav';

export default function AUSOLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AUSONav />
      <main className="container mx-auto flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
