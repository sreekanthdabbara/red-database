import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../api/axios';
import './PrevalenceIncidence.css';

const GENDER_OPTIONS = ['All', 'Both', 'Male', 'Female'];

export default function PrevalenceIncidence() {
  // Filter options from DB
  const [diseases, setDiseases] = useState([]);
  const [countries, setCountries] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [continents, setContinents] = useState([]);

  // Selected filters
  const [selDisease, setSelDisease] = useState('');
  const [selCountry, setSelCountry] = useState('');
  const [selMetric, setSelMetric] = useState('');
  const [selGender, setSelGender] = useState('All');
  const [selSpecialty, setSelSpecialty] = useState('');
  const [selContinent, setSelContinent] = useState('');
  const [search, setSearch] = useState('');
  const [yearFrom, setYearFrom] = useState(1965);
  const [yearTo, setYearTo] = useState(2026);

  // Data
  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load dropdown options once
  useEffect(() => {
    api.get('/epi/filter-options')
      .then(r => {
        setDiseases(r.data.diseases);
        setCountries(r.data.countries);
        setMetrics(r.data.metrics);
        setContinents(r.data.continents || []);
      })
      .catch(() => { });
  }, []);

  // Fetch data whenever filters change
  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    const params = new URLSearchParams();
    if (selDisease) params.set('disease', selDisease);
    if (selContinent) params.set('continent', selContinent);
    if (selCountry) params.set('country', selCountry);
    if (selGender && selGender !== 'All') params.set('gender', selGender);
    if (selMetric) params.set('epi_metric', selMetric);
    if (search) params.set('search', search);
    params.set('year_from', yearFrom);
    params.set('year_to', yearTo);

    try {
      const [tableRes, chartRes] = await Promise.all([
        api.get(`/epi?${params}`),
        api.get(`/epi/chart/by-country?${params}`),
      ]);
      setTableData(tableRes.data);
      setChartData(
        chartRes.data.map(r => ({
          name: `${r.country_area} (${r.published_period})`,
          estimate: parseFloat(r.estimate),
        }))
      );
    } catch {
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [selDisease, selContinent, selCountry, selGender, selMetric, search, yearFrom, yearTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = () => {
    const headers = ['Country/Area', 'Published Period', 'Study Year', 'Disease', 'Gender', 'Age', 'Race', 'Ethnicity', 'Epi Metric', 'Estimate Text', 'Value', 'Sample Size', 'Study Design', 'Reference', 'URL'];
    const csvRows = [headers.join(',')];
    tableData.forEach(r => {
      csvRows.push([
        r.country_area, r.published_period, r.study_year, r.disease_name,
        r.gender_type, `"${(r.age_group || '').replace(/"/g, '""')}"`,
        r.race, r.ethnicity, `"${(r.epi_metric || '').replace(/"/g, '""')}"`,
        `"${(r.prevalence_estimate_text || '').replace(/"/g, '""')}"`,
        r.value_estimation, `"${(r.study_sample_size || '').replace(/"/g, '""')}"`,
        `"${(r.study_design || '').replace(/"/g, '""')}"`,
        `"${(r.reference || '').replace(/"/g, '""')}"`,
        r.url,
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `RED_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="prev-page">
      {/* ── Top Controls ──────────────────────────────────── */}
      <div className="prev-controls">
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
          <span className="year-clean-label">Historical year</span>
          <div className="year-clean-row">
            <span className="year-arrow">←</span>
            <div className="year-track" style={{
              background: `linear-gradient(to right, 
      #d0d8e4 0%, 
      #d0d8e4 ${((yearFrom - 1965) / (2026 - 1965)) * 100}%, 
      var(--blue-accent) ${((yearFrom - 1965) / (2026 - 1965)) * 100}%, 
      var(--blue-accent) ${((yearTo - 1965) / (2026 - 1965)) * 100}%, 
      #d0d8e4 ${((yearTo - 1965) / (2026 - 1965)) * 100}%, 
      #d0d8e4 100%)`
            }}>
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
          <button className="btn-save">Save your report</button>
        </div>
      </div>

      <div className="prev-body">
        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="prev-sidebar">
          <h3 className="sidebar-title">Selections</h3>

          <label className="fl">Region</label>
          <select className="fs" value={selContinent} onChange={e => setSelContinent(e.target.value)}>
            <option value="">All regions</option>
            {continents.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="fl">Country / Area</label>
          <select className="fs" value={selCountry} onChange={e => setSelCountry(e.target.value)}>
            <option value="">All countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="fl">Epi metric</label>
          <select className="fs" value={selMetric} onChange={e => setSelMetric(e.target.value)}>
            <option value="">All metrics</option>
            {metrics.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <label className="fl">Gender</label>
          <select className="fs" value={selGender} onChange={e => setSelGender(e.target.value)}>
            {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <div className="sidebar-count">
            {loading ? '…' : `${tableData.length} record${tableData.length !== 1 ? 's' : ''}`}
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────── */}
        <div className="prev-main">
          <div className="view-toggle">
            <button className={`tb${viewMode === 'table' ? ' active' : ''}`} onClick={() => setViewMode('table')}>Table</button>
            <button className={`tb${viewMode === 'chart' ? ' active' : ''}`} onClick={() => setViewMode('chart')}>Chart</button>
          </div>

          {error && <div className="prev-error">{error}</div>}

          {loading ? (
            <div className="prev-loading"><div className="spinner" />Loading data…</div>
          ) : viewMode === 'table' ? (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Country / Area</th><th>Published Period</th><th>Study Year</th>
                    <th>Disease Name</th><th>Gender</th><th>Age</th><th>Race</th>
                    <th>Ethnicity</th><th>Epi Metric</th><th>Prevalence Estimate</th>
                    <th>Value</th><th>Study Sample Size</th><th>Study Design</th>
                    <th>Reference</th><th>URL</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr><td colSpan={15} className="no-data">No records match the selected filters.</td></tr>
                  ) : tableData.map((row) => (
                    <tr key={row.id}>
                      <td className="country-cell">{row.country_area}</td>
                      <td>{row.published_period}</td>
                      <td>{row.study_year}</td>
                      <td className="disease-cell">{row.disease_name}</td>
                      <td>{row.gender_type}</td>
                      <td className="wrap-cell">{row.age_group}</td>
                      <td>{row.race}</td>
                      <td className="wrap-cell">{row.ethnicity}</td>
                      <td className="metric-cell">{row.epi_metric}</td>
                      <td className="estimate-text-cell">{row.prevalence_estimate_text}</td>
                      <td className="value-cell">{row.value_estimation}</td>
                      <td className="wrap-cell">{row.study_sample_size}</td>
                      <td>{row.study_design}</td>
                      <td className="ref-cell" title={row.reference}>{row.reference}</td>
                      <td className="url-cell">
                        {row.url && <a href={row.url} target="_blank" rel="noreferrer" className="url-link">Link ↗</a>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="chart-wrapper">
              <h3 className="chart-title">{selDisease || 'All Diseases'} — Prevalence Estimates by Country</h3>
              {chartData.length === 0 ? (
                <div className="no-data">No chart data for current filters.</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 44)}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 200, right: 60, top: 10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={195} />
                    <Tooltip formatter={(v) => [`${v}`, 'Estimate']} contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="estimate" radius={[0, 4, 4, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? '#8fafd6' : '#6b95c4'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <p className="chart-note"><em>Note: Displays the highest reported estimate per country/period combination</em></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}