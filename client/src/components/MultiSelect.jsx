// Checkbox dropdown for picking several values (e.g. countries).
// An empty selection means "all" — the trigger then shows `allLabel`.
import React, { useState, useEffect, useRef } from 'react';
import './MultiSelect.css';

export default function MultiSelect({ options, selected, onChange, allLabel = 'All', noun = 'items' }) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const toggle = (opt) =>
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);

  const visible = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const label =
    selected.length === 0 ? allLabel
    : selected.length === 1 ? selected[0]
    : `${selected.length} ${noun} selected`;

  return (
    <div className="ms" ref={ref}>
      <button type="button" className={`ms-trigger${open ? ' open' : ''}`}
        title={selected.join(', ') || allLabel}
        onClick={() => setOpen(o => !o)}>
        {label}
      </button>

      {open && (
        <div className="ms-panel">
          {options.length > 8 && (
            <input className="ms-search" type="text" placeholder="Search…" autoFocus
              value={search} onChange={e => setSearch(e.target.value)} />
          )}
          <div className="ms-actions">
            <button type="button" onClick={() => onChange([...options])}>Select all</button>
            <button type="button" title={`Clear — show ${allLabel.toLowerCase()}`} onClick={() => onChange([])}>Clear</button>
          </div>
          <div className="ms-list">
            {visible.length === 0 && <div className="ms-empty">No matches</div>}
            {visible.map(opt => (
              <label key={opt} className="ms-option">
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
