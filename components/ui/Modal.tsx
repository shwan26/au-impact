'use client';
import { useEffect } from 'react';
export default function Modal({ open, onClose, children }: { open: boolean; onClose: ()=>void; children: React.ReactNode }){
  useEffect(()=>{
    function onEsc(e: KeyboardEvent){ if (e.key==='Escape') onClose(); }
    document.addEventListener('keydown', onEsc);
    return ()=>document.removeEventListener('keydown', onEsc);
  },[onClose]);
  if (!open) return null;
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.2)'}} onClick={onClose}>
      <div className="card" style={{maxWidth:600,margin:'10vh auto',background:'#fff'}} onClick={e=>e.stopPropagation()}>{children}</div>
    </div>
  );
}