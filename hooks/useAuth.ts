'use client';
import { useEffect, useState } from 'react';
import { User } from '@/types/db';

export function useAuth(){
  const [user, setUser] = useState<User | null>(null);

  useEffect(()=>{
    try {
      const raw = localStorage.getItem('au_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  },[]);

  function logout(){
    localStorage.removeItem('au_user');
    document.cookie = 'au_role=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
    window.location.href = '/public';
  }

  return { user, logout };
}
