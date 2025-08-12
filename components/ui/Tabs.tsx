'use client';
import { useState } from 'react';
export default function Tabs({ tabs }: { tabs: { key: string; label: string; content: React.ReactNode }[] }){
  const [active, setActive] = useState(tabs[0]?.key);
  return (
    <div>
      <div style={{display:'flex',gap:8}}>
        {tabs.map(t=> (
          <button key={t.key} onClick={()=>setActive(t.key)}>{t.label}</button>
        ))}
      </div>
      <div style={{marginTop:12}}>
        {tabs.find(t=>t.key===active)?.content}
      </div>
    </div>
  );
}
