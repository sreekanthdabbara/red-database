// Definitions.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export function Definitions() {
  const [defs, setDefs]     = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/definitions').then(r => setDefs(r.data)).catch(() => {});
  }, []);

  const filtered = defs.filter(d =>
    d.term.toLowerCase().includes(search.toLowerCase()) ||
    d.definition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 20, color: 'var(--gray-800)' }}>
        Glossary &amp; Definitions
      </h2>
      <input
        type="text"
        placeholder="Search terms…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          padding: '10px 14px', border: '1.5px solid var(--gray-200)',
          borderRadius: 'var(--radius)', width: 320, marginBottom: 24,
          fontSize: 14, outline: 'none',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(d => (
          <div key={d.id} style={{
            background: 'white', borderRadius: 'var(--radius)',
            padding: '16px 20px', border: '1px solid var(--gray-200)',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--teal-dark)', marginBottom: 4 }}>{d.term}</div>
            <div style={{ color: 'var(--gray-600)', fontSize: 13, lineHeight: 1.6 }}>{d.definition}</div>
            {d.category && (
              <span style={{
                display: 'inline-block', marginTop: 8, fontSize: 11, padding: '2px 8px',
                background: 'var(--teal-light)', color: 'var(--teal-dark)', borderRadius: 99,
              }}>{d.category}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Mortality.jsx
export function Mortality() {
  return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Mortality</h2>
      <p>Mortality data coming soon. Add your records via the database schema.</p>
    </div>
  );
}

// WorldPopulation.jsx
export function WorldPopulation() {
  return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>World Population</h2>
      <p>World population data coming soon.</p>
    </div>
  );
}

// Contact.jsx
export function Contact() {
  return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Contact Us</h2>
      <p>Please reach out at <a href="mailto:contact@red-database.com" style={{ color: 'var(--teal)' }}>contact@red-database.com</a></p>
    </div>
  );
}
