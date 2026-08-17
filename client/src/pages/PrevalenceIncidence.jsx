import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../api/axios';
import './PrevalenceIncidence.css';

// ── Pivot by published_period (year) as columns ───────────────
function pivotByYear(data) {
  const years = [...new Set(data.map(r => r.published_period))].sort();
  const grouped = {};

  data.forEach(row => {
    const key = `${row.country_area}||${row.disease_name}||${row.gender_type}||${row.epi_metric}`;
    if (!grouped[key]) {
      grouped[key] = {
        country_area:  row.country_area,
        disease_name:  row.disease_name,
        gender_type:   row.gender_type,
        age_group:     row.age_group,
        race:          row.race,
        ethnicity:     row.ethnicity,
        epi_metric:    row.epi_metric,
        study_design:  row.study_design,
        reference:     row.reference,
        url:           row.url,
      };
    }
    grouped[key][row.published_period] = row.value_estimation;
    grouped[key][`est_${row.published_period}`] = row.prevalence_estimate_text;
  });

  return { rows: Object.values(grouped), years };
}

export default function PrevalenceIncidence() {
  // Filter options — all dynamic
  const [continents, setContinents] = useState([]);
  const [countries,  setCountries]  = useState([]);
  const [diseases,   setDiseases]   = useState([]);
  const [metrics,    setMetrics]    = useState([]);
  const [genders,    setGenders]    = useState([]);

  // Selected filters
  const [selContinent, setSelContinent] = useState('');
  const [selCountry,   setSelCountry]   = useState('');
  const [selDisease,   setSelDisease]   = useState('');
  const [selMetric,    setSelMetric]    = useState('');
  const [selGender,    setSelGender]    = useState('');
  const [yearFrom,     setYearFrom]     = useState(1965);
  const [yearTo,       setYearTo]       = useState(2026);

  // Data
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [viewMode,  setViewMode]  = useState('table');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // ── 1. Load continents on mount ───────────────────────────
  useEffect(() => {
    api.get('/epi/filter-options')
      .then(r => setContinents(r.data.continents || []))
      .catch(() => {});
  }, []);

  // ── 2. Load countries when continent changes ──────────────
  useEffect(() => {
    const url = selContinent
      ? `/epi/countries?continent=${encodeURIComponent(selContinent)}`
      : '/epi/countries';
    api.get(url)
      .then(r => {
        setCountries(r.data || []);
        setSelCountry(r.data?.[0] || '');
      })
      .catch(() => {});
  }, [selContinent]);

  // ── 3. Load diseases when country changes ─────────────────
  useEffect(() => {
    if (!selCountry) return;
    const params = new URLSearchParams();
    params.set('country', selCountry);
    if (selContinent) params.set('continent', selContinent);
    api.get(`/epi/diseases?${params}`)
      .then(r => {
        setDiseases(r.data || []);
        setSelDisease(r.data?.[0] || '');
      })
      .catch(() => {});
  }, [selCountry, selContinent]);

  // ── 4. Load metrics when disease changes ──────────────────
  useEffect(() => {
    if (!selCountry || !selDisease) return;
    const params = new URLSearchParams();
    params.set('country', selCountry);
    params.set('disease', selDisease);
    if (selContinent) params.set('continent', selContinent);
    api.get(`/epi/metrics?${params}`)
      .then(r => {
        setMetrics(r.data || []);
        setSelMetric(r.data?.[0] || '');
      })
      .catch(() => {});
  }, [selCountry, selDisease, selContinent]);

  // ── 5. Load genders when disease changes ──────────────────
  useEffect(() => {
    if (!selCountry || !selDisease) return;
    const params = new URLSearchParams();
    params.set('country', selCountry);
    params.set('disease', selDisease);
    if (selContinent) params.set('continent', selContinent);
    api.get(`/epi/genders?${params}`)
      .then(r => {
        setGenders(r.data || []);
        setSelGender(r.data?.[0] || '');
      })
      .catch(() => {});
  }, [selCountry, selDisease, selContinent]);

  // ── 6. Fetch table data ───────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    const params = new URLSearchParams();
    if (selDisease)   params.set('disease',    selDisease);
    if (selContinent) params.set('continent',  selContinent);
    if (selCountry)   params.set('country',    selCountry);
    if (selGender)    params.set('gender',     selGender);
    if (selMetric)    params.set('epi_metric', selMetric);
    params.set('year_from', yearFrom);
    params.set('year_to',   yearTo);

    try {
      const [tableRes, chartRes] = await Promise.all([
        api.get(`/epi?${params}`),
        api.get(`/epi/chart/by-country?${params}`),
      ]);
      setTableData(tableRes.data);
      setChartData(
        chartRes.data.map(r => ({
          name:     `${r.country_area} (${r.published_period})`,
          estimate: parseFloat(r.estimate),
        }))
      );
    } catch {
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [selDisease, selContinent, selCountry, selGender, selMetric, yearFrom, yearTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pivoted = useMemo(() => pivotByYear(tableData), [tableData]);

  const handleExport = () => {
    const { rows, years } = pivoted;
    const headers = [
      'Country/Area', 'Disease', 'Gender', 'Age', 'Race',
      'Ethnicity', 'Epi Metric', 'Study Design', 'Reference',
      ...years.map(y => `${y} Value`),
      ...years.map(y => `${y} Estimate`),
    ];
    const csvRows = [headers.join(',')];
    rows.forEach(r => {
      csvRows.push([
        r.country_area, r.disease_name, r.gender_type,
        `"${(r.age_group || '').replace(/"/g, '""')}"`,
        r.race, r.ethnicity,
        `"${(r.epi_metric || '').replace(/"/g, '""')}"`,
        `"${(r.study_design || '').replace(/"/g, '""')}"`,
        `"${(r.reference || '').replace(/"/g, '""')}"`,
        ...years.map(y => r[y] ?? ''),
        ...years.map(y => `"${(r[`est_${y}`] || '').replace(/"/g, '""')}"`),
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `REED_epi_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="prev-page">

      {/* ── Top Controls ──────────────────────────────────── */}
      <div className="prev-controls">
        <div className="ctrl-divider" />

        <div className="ctrl-pills">
          <div className="pill-dropdown">
            <span className="pill-label">Disease</span>
            <select value={selDisease} onChange={e => setSelDisease(e.target.value)}>
              {diseases.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <span className="pill-arrow">›</span>
          </div>
          <div className="pill-dropdown">
            <span className="pill-label">Epi Metric</span>
            <select value={selMetric} onChange={e => setSelMetric(e.target.value)}>
              {metrics.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="pill-arrow">›</span>
          </div>
        </div>

        <div className="ctrl-year-clean">
          <span className="year-clean-label">Historical year</span>
          <div className="year-clean-row">
            <span className="year-arrow">←</span>
            <div
              className="year-track"
              style={{
                background: `linear-gradient(to right,
                  #E8EAF0 0%,
                  #E8EAF0 ${((yearFrom - 1965) / (2026 - 1965)) * 100}%,
                  #0F7B6C ${((yearFrom - 1965) / (2026 - 1965)) * 100}%,
                  #0F7B6C ${((yearTo - 1965) / (2026 - 1965)) * 100}%,
                  #E8EAF0 ${((yearTo - 1965) / (2026 - 1965)) * 100}%,
                  #E8EAF0 100%)`,
              }}
            >
              <input type="range" min={1965} max={yearTo} value={yearFrom}
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

      <div className="prev-body">

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
          <select className="fs" value={selCountry}
            onChange={e => setSelCountry(e.target.value)}>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="fl">Disease</label>
          <select className="fs" value={selDisease}
            onChange={e => setSelDisease(e.target.value)}>
            {diseases.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <label className="fl">Epi metric</label>
          <select className="fs" value={selMetric}
            onChange={e => setSelMetric(e.target.value)}>
            {metrics.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <label className="fl">Gender</label>
          <select className="fs" value={selGender}
            onChange={e => setSelGender(e.target.value)}>
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <div className="sidebar-count">
            {loading ? '…' : `${pivoted.rows.length} record${pivoted.rows.length !== 1 ? 's' : ''}`}
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────── */}
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

            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Country / Area</th>
                    <th>Disease Name</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Race</th>
                    <th>Ethnicity</th>
                    <th>Epi Metric</th>
                    <th>Study Design</th>
                    <th>Reference</th>
                    <th>URL</th>
                    {pivoted.years.map(y => <th key={y}>{y}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {pivoted.rows.length === 0 ? (
                    <tr>
                      <td colSpan={10 + pivoted.years.length} className="no-data">
                        No records match the selected filters.
                      </td>
                    </tr>
                  ) : pivoted.rows.map((row, i) => (
                    <tr key={i}>
                      <td className="country-cell" title={row.country_area}>{row.country_area}</td>
                      <td className="disease-cell" title={row.disease_name}>{row.disease_name}</td>
                      <td title={row.gender_type}>{row.gender_type}</td>
                      <td className="wrap-cell" title={row.age_group}>{row.age_group}</td>
                      <td title={row.race}>{row.race}</td>
                      <td className="wrap-cell" title={row.ethnicity}>{row.ethnicity}</td>
                      <td className="metric-cell" title={row.epi_metric}>{row.epi_metric}</td>
                      <td title={row.study_design}>{row.study_design}</td>
                      <td className="ref-cell" title={row.reference}>{row.reference}</td>
                      <td className="url-cell">
                        {row.url && (
                          <a href={row.url} target="_blank" rel="noreferrer" className="url-link">
                            Link ↗
                          </a>
                        )}
                      </td>
                      {pivoted.years.map(y => (
                        <td key={y} className="value-cell"
                          title={row[y] != null
                            ? `${row[y]} (${row[`est_${y}`] || ''})`
                            : '—'}>
                          {row[y] != null ? row[y] : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : (

            <div className="chart-wrapper">
              <h3 className="chart-title">
                {selDisease || 'All Diseases'} — Prevalence Estimates by Country
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
                      formatter={(v) => [`${v}`, 'Estimate']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8EAF0' }}
                    />
                    <Bar dataKey="estimate" radius={[0, 4, 4, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? '#0F7B6C' : '#18A092'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <p className="chart-note">
                <em>Note: Displays the highest reported estimate per country/period combination</em>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}