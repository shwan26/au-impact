'use client';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';

export default function Nav() {
  return (
    <nav className="navbar">
      <div 
        className="container" 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0'
        }}
      >
        <Link href="/public">
          <strong style={{ fontSize: '1.2rem' }}>AU Impact</strong>
        </Link>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/public/event">Event</Link>
          <Link href="/public/fundraising">Fundraising</Link>
          <Link href="/public/merchandise">Merchandise</Link>
          <Link href="/public/announcements">Announcements</Link>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
