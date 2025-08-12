'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useProtectedRoute(role?: string){
  const router = useRouter();
  useEffect(()=>{
    const hasRole = /(?:^|; )au_role=/.test(document.cookie);
    if (!hasRole) router.replace('/login');
  },[router]);
}
