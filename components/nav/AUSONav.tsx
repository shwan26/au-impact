'use client';
import Link from 'next/link';
import LogoutButton from '../auth/LogoutButton';
export default function AUSONav(){
  return (
    <nav className='navbar'>
        <div className="container"
            style={{
                  display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0'
            
            }}>
            <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/auso"><strong style={{ fontSize: '1.2rem' }}>AUSO</strong></Link>
           
              <Link href="/auso/event">Events</Link>
              <Link href="/auso/fundraising">Fundraising</Link>
              <Link href="/auso/merchandise">Merch</Link>
              <Link href="/auso/announcements">Announcements</Link>
            </div>
            <span style={{flex:1}}/>
            <LogoutButton />
        </div>
    </nav>
  );
}