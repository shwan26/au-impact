'use client';

type Cell = string | number | boolean | null | undefined | Date;
export type Row = Record<string, Cell>;

export default function GenericTable({
  rows,
  columns,
}: {
  rows: Row[];
  columns: string[];
}) {
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '8px' }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {columns.map((c) => {
                const val = (r as Record<string, Cell>)[c];
                const out = val instanceof Date ? val.toLocaleString() : String(val ?? '');
                return (
                  <td key={c} style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
                    {out}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
