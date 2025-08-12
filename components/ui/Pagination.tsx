'use client';
export default function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p:number)=>void }){
  return (
    <div style={{display:'flex',gap:8}}>
      <button onClick={()=>onPage(Math.max(1,page-1))} disabled={page<=1}>Prev</button>
      <span>{page} / {pages}</span>
      <button onClick={()=>onPage(Math.min(pages,page+1))} disabled={page>=pages}>Next</button>
    </div>
  );
}