'use client';
export default function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} style={{width:'100%',padding:8,border:'1px solid var(--border)',borderRadius:'var(--radius)'}}/>;
}