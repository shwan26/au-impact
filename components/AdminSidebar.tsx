import Link from 'next/link';
import { usePendingCounts } from '@/hooks/usePendingCounts';

// Small helper to show label + badge
function MenuItem({ href, label, badge }: { href: string; label: string; badge?: number }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100"
    >
      <span>{label}</span>
      {!!badge && badge > 0 && (
        <span className="ml-2 inline-flex min-w-[1.5rem] justify-center rounded-full bg-red-600 px-2 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function AdminSidebar() {
  // 🔥 Pull live AUSO-wide pending counts
  const { counts, loading } = usePendingCounts('AUSO');
  const { announcements, events, fundraising, total } = counts;

  return (
    <nav className="space-y-1">
      <MenuItem href="/auso/announcements" label="Announcements" badge={loading ? 0 : announcements} />
      <MenuItem href="/auso/events"        label="Events"        badge={loading ? 0 : events} />
      <MenuItem href="/auso/fundraising"   label="Fundraising"   badge={loading ? 0 : fundraising} />

      <div className="mt-2 border-t pt-2">
        <MenuItem href="/auso/pending"     label="All Pending"   badge={loading ? 0 : total} />
      </div>
    </nav>
  );
}
