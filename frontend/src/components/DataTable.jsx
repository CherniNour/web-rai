import { useMemo, useState } from 'react';
import { SearchIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

export default function DataTable({ columns, data = [], searchKey = '', searchable = true, pageSize = 10 }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const term = (q || searchKey).trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) =>
      columns.some((c) => {
        const val = c.searchValue ? c.searchValue(row) : row[c.key];
        return String(val ?? '').toLowerCase().includes(term);
      })
    );
  }, [data, q, searchKey, columns]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const rows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return (
    <div>
      {searchable && (
        <div className="toolbar">
          <div className="search">
            <span><SearchIcon size={15} /></span>
            <input
              placeholder="Rechercher..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <span className="record-count">{filtered.length} enregistrement(s)</span>
        </div>
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row._id || i}>
                {columns.map((c) => (
                  <td key={c.key}>{c.render ? c.render(row, i) : row[c.key]}</td>
                ))}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: 26, color: 'var(--text-muted)' }}>
                  Aucun enregistrement trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" disabled={safePage === 0} onClick={() => setPage((p) => p - 1)} aria-label="Page précédente">
            <ChevronLeftIcon size={16} />
          </button>
          <span className="pagination-info">{safePage + 1} / {pages}</span>
          <button
            className="pagination-btn"
            disabled={safePage >= pages - 1}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Page suivante"
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
}