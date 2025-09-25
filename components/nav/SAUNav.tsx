'use client';
import Link from 'next/link';
import LogoutButton from '../auth/LogoutButton';
export default function SAUNav(){
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
            <Link href="/sau"><strong style={{ fontSize: '1.2rem' }}>SAU</strong></Link>
            <div style={{ display: 'flex', gap: '24px' }}>
              <Link href="/sau/event">Events</Link>
              <Link href="/sau/fundraising">Fundraising</Link>
              <Link href="/sau/merchandise">Merch</Link>
              <Link href="/sau/announcements">Announcements</Link>
            </div>
            <span style={{flex:1}}/>
            <LogoutButton />
        </div>
    </nav>
  );
}