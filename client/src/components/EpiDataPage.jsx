// Shared page for flat epi data tables (Mortality, Incidence).
// Table shows `tableColumns`; Download exports `exportColumns`.
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../api/axios';
import MultiSelect from './MultiSelect';
import '../pages/Survival.css';

// Keep the current choice if the reloaded list still has it, else fall back to "All" ('')
const keepIfListed = (list) => (prev) => ((list || []).includes(prev) ? prev : '');

// Arrays become repeated params: { country: ['A', 'B'] } → country=A&country=B
const qs = (obj) => {
  const params = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach(x => params.append(k, x));
    else if (v) params.set(k, v);
  });
  return params.toString();
};

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '');

// Date of update falls back to when the row was loaded
const cellText = (row, key) =>
  key === 'date_of_update' ? formatDate(row.date_of_update || row.created_at) : row[key];

export default function EpiDataPage({
  apiPath,        // e.g. '/mortality'
  typeKey,        // row field for the type/metric, e.g. 'mortality_type'
  typeLabel,      // e.g. 'Mortality type'
  title,          // e.g. 'Mortality'
  tableColumns,   // [{ label, key, className? }]
  exportColumns,  // [{ label, key }]
}) {
  // Filter options
  const [continents,  setContinents]  = useState([]);
  const [countries,   setCountries]   = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [diseases,    setDiseases]    = useState([]);
  const [genders,     setGenders]     = useState([]);
  const [types,       setTypes]       = useState([]);

  // Selected filters
  const [selContinent, setSelContinent] = useState('');
  const [selCountries, setSelCountries] = useState([]);   // empty = all countries
  const [selSpecialty, setSelSpecialty] = useState('');
  const [selDisease,   setSelDisease]   = useState('');
  const [selGender,    setSelGender]    = useState('');
  const [selType,      setSelType]      = useState('');
  const [yearFrom,     setYearFrom]     = useState(1990);
  const [yearTo,       setYearTo]       = useState(2026);

  // Data
  const [tableData, setTableData] = useState([]);
  const [viewMode,  setViewMode]  = useState('table');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // ── 1. Load continents on mount ───────────────────────────
  useEffect(() => {
    api.get(`${apiPath}/continents`)
      .then(r => setContinents(r.data || []))
      .catch(() => {});
  }, [apiPath]);

  // ── 2. Load countries when continent changes ──────────────
  useEffect(() => {
    api.get(`${apiPath}/countries?${qs({ continent: selContinent })}`)
      .then(r => {
        setCountries(r.data || []);
        setSelCountries([]);
      })
      .catch(() => {});
  }, [apiPath, selContinent]);

  // ── 3. Load specialties when country changes ──────────────
  useEffect(() => {
    api.get(`${apiPath}/specialties?${qs({ continent: selContinent, country: selCountries })}`)
      .then(r => {
        setSpecialties(r.data || []);
        setSelSpecialty(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [apiPath, selCountries, selContinent]);

  // ── 4. Load diseases when specialty or country changes ────
  useEffect(() => {
    api.get(`${apiPath}/diseases?${qs({ continent: selContinent, country: selCountries, specialty: selSpecialty })}`)
      .then(r => {
        setDiseases(r.data || []);
        setSelDisease(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [apiPath, selCountries, selSpecialty, selContinent]);

  // ── 5. Load genders when disease changes ──────────────────
  useEffect(() => {
    api.get(`${apiPath}/genders?${qs({ continent: selContinent, country: selCountries, disease: selDisease })}`)
      .then(r => {
        setGenders(r.data || []);
        setSelGender(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [apiPath, selDisease, selCountries, selContinent]);

  // ── 6. Load types when gender changes ─────────────────────
  useEffect(() => {
    api.get(`${apiPath}/types?${qs({ continent: selContinent, country: selCountries, disease: selDisease, gender: selGender })}`)
      .then(r => {
        setTypes(r.data || []);
        setSelType(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [apiPath, selDisease, selCountries, selContinent, selGender]);

  // ── 7. Fetch table data ───────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    const params = qs({
      continent: selContinent,
      country:   selCountries,
      specialty: selSpecialty,
      disease:   selDisease,
      gender:    selGender,
      type:      selType,
      year_from: yearFrom,
      year_to:   yearTo,
    });

    try {
      const res = await api.get(`${apiPath}?${params}`);
      setTableData(res.data);
    } catch {
      setError(`Failed to load ${title.toLowerCase()} data.`);
    } finally {
      setLoading(false);
    }
  }, [apiPath, title, selContinent, selCountries, selSpecialty, selDisease, selGender, selType, yearFrom, yearTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Chart data ────────────────────────────────────────────
  const chartData = tableData
    .filter(r => !isNaN(parseFloat(r.epi_value)))
    .slice(0, 20)
    .map(r => ({
      name:  `${r.country_area} (${r.published_period})`,
      value: parseFloat(r.epi_value),
      label: `${r[typeKey]} — ${r.estimate}`,
    }));

  // ── Export all columns ────────────────────────────────────
  const handleExport = () => {
    const csvRows = [exportColumns.map(c => csvCell(c.label)).join(',')];
    tableData.forEach(r => {
      csvRows.push(exportColumns.map(c => csvCell(cellText(r, c.key))).join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `REED_${title.toLowerCase()}_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="surv-page">

      {/* ── Top Controls ──────────────────────────────────── */}
      <div className="surv-controls">
        <div className="ctrl-divider" />

        <div className="ctrl-pills">
          <div className="pill-dropdown">
            <span className="pill-label">Disease specialty</span>
            <select value={selSpecialty} onChange={e => setSelSpecialty(e.target.value)}>
              <option value="">All specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="pill-arrow">›</span>
          </div>
          <div className="pill-dropdown">
            <span className="pill-label">Disease</span>
            <select value={selDisease} onChange={e => setSelDisease(e.target.value)}>
              <option value="">All diseases</option>
              {diseases.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <span className="pill-arrow">›</span>
          </div>
        </div>

        <div className="ctrl-year-clean">
          <span className="year-clean-label">Published year</span>
          <div className="year-clean-row">
            <span className="year-arrow">←</span>
            <div className="year-track"
              style={{
                background: `linear-gradient(to right,
                  #E8EAF0 0%,
                  #E8EAF0 ${((yearFrom - 1990) / (2026 - 1990)) * 100}%,
                  #0F7B6C ${((yearFrom - 1990) / (2026 - 1990)) * 100}%,
                  #0F7B6C ${((yearTo - 1990) / (2026 - 1990)) * 100}%,
                  #E8EAF0 ${((yearTo - 1990) / (2026 - 1990)) * 100}%,
                  #E8EAF0 100%)`,
              }}
            >
              <input type="range" min={1990} max={yearTo} value={yearFrom}
                onChange={e => setYearFrom(+e.target.value)} />
              <input type="range" min={yearFrom} max={2026} value={yearTo}
                onChange={e => setYearTo(+e.target.value)} />
            </div>
            <span className="year-arrow">→</span>
          </div>
          <div className="year-clean-nums">
            <span>{yearFrom}</span>
            <span>{yearTo}</span>
          </div>
        </div>

        <div className="ctrl-actions">
          <button className="btn-dl" onClick={handleExport}>⬇ Download</button>
        </div>
      </div>

      <div className="surv-body">

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="prev-sidebar">
          <h3 className="sidebar-title">Selections</h3>

          <label className="fl">Region</label>
          <select className="fs" value={selContinent}
            onChange={e => setSelContinent(e.target.value)}>
            <option value="">All regions</option>
            {continents.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="fl">Country / Area</label>
          <MultiSelect options={countries} selected={selCountries}
            onChange={setSelCountries} allLabel="All countries" noun="countries" />

          <label className="fl">Disease specialty</label>
          <select className="fs" value={selSpecialty}
            onChange={e => setSelSpecialty(e.target.value)}>
            <option value="">All specialties</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <label className="fl">Disease</label>
          <select className="fs" value={selDisease}
            onChange={e => setSelDisease(e.target.value)}>
            <option value="">All diseases</option>
            {diseases.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <label className="fl">Gender</label>
          <select className="fs" value={selGender}
            onChange={e => setSelGender(e.target.value)}>
            <option value="">All genders</option>
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <label className="fl">{typeLabel}</label>
          <select className="fs" value={selType}
            onChange={e => setSelType(e.target.value)}>
            <option value="">All types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div className="sidebar-count">
            {loading ? '…' : `${tableData.length} record${tableData.length !== 1 ? 's' : ''}`}
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────── */}
        <div className="prev-main">
          <div className="view-toggle">
            <button className={`tb${viewMode === 'table' ? ' active' : ''}`}
              onClick={() => setViewMode('table')}>Table</button>
            <button className={`tb${viewMode === 'chart' ? ' active' : ''}`}
              onClick={() => setViewMode('chart')}>Chart</button>
          </div>

          {error && <div className="prev-error">{error}</div>}

          {loading ? (
            <div className="prev-loading"><div className="spinner" />Loading data…</div>
          ) : viewMode === 'table' ? (

            /* ── TABLE — selected columns only ───────────────── */
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {tableColumns.map(c => <th key={c.key}>{c.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={tableColumns.length} className="no-data">
                        No records match the selected filters.
                      </td>
                    </tr>
                  ) : tableData.map((row, i) => (
                    <tr key={i}>
                      {tableColumns.map(c => (
                        <td key={c.key} className={c.className} title={row[c.key]}>
                          {cellText(row, c.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : (

            /* ── CHART ───────────────────────────────────────── */
            <div className="chart-wrapper">
              <h3 className="chart-title">
                {selDisease || 'All Diseases'} — {title} by Country
              </h3>
              {chartData.length === 0 ? (
                <div className="no-data">No chart data for current filters.</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 44)}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 200, right: 60, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8EAF0" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <YAxis type="category" dataKey="name"
                      tick={{ fontSize: 11, fill: '#374151' }} width={195} />
                    <Tooltip
                      formatter={(v, __, p) => [`${v} (${p.payload.label})`, title]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8EAF0' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? '#0F7B6C' : '#18A092'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <p className="chart-note">
                <em>Note: Displays epi values for selected filters; units vary by estimate type</em>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
