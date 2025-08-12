'use client';
import Link from 'next/link';
import AuthButton from '@/components/auth/AuthButton';
export default function AUSONav(){
  return (
    <nav className="container" style={{display:'flex',gap:16,alignItems:'center',padding:'16px 0'}}>
      <Link href="/auso"><strong>AUSO</strong></Link>
      <Link href="/auso/event">Events</Link>
      <Link href="/auso/fundraising">Fundraising</Link>
      <Link href="/auso/merchandise">Merch</Link>
      <Link href="/auso/announcements">Announcements</Link>
      <span style={{flex:1}}/>
      <AuthButton />
    </nav>
  );
}