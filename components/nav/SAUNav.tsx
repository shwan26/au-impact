'use client';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';
export default function SAUNav(){
  return (
    <nav className="container">
        <div className="navbar"
            style={{display:'flex',gap:16,alignItems:'center',padding:'16px 0'}}>
            <Link href="/sau"><strong>SAU</strong></Link>
            <Link href="/sau/event">Events</Link>
            <Link href="/sau/fundraising">Fundraising</Link>
            <Link href="/sau/merchandise">Merch</Link>
            <Link href="/sau/announcements">Announcements</Link>
            <span style={{flex:1}}/>
            <AuthButton />
        </div>
    </nav>
  );
}