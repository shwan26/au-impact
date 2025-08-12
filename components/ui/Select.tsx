'use client';
export default function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>){
  return <select {...props} style={{width:'100%',padding:8,border:'1px solid var(--border)',borderRadius:'var(--radius)'}}/>;
}