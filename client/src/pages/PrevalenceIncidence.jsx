import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../api/axios';
import MultiSelect from '../components/MultiSelect';
import EpiInsights from '../components/EpiInsights';
import './PrevalenceIncidence.css';

// Keep the current choice if the reloaded list still has it, else fall back to "All" ('')
const keepIfListed = (list) => (prev) => ((list || []).includes(prev) ? prev : '');

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '');

// Date of update falls back to when the row was loaded;
// value_estimation is DECIMAL(12,4), so drop trailing zeros ("6.6700" → "6.67")
const cellText = (row, key) => {
  if (key === 'date_of_update') return formatDate(row.date_of_update || row.created_at);
  if (key === 'value_estimation' && row[key] != null) return String(Number(row[key]));
  return row[key];
};

// Table shows these; Download exports EXPORT_COLUMNS.
// specialty_1 / data_source_type / date_of_update are empty for older prevalence_data rows —
// they show once the columns are added to the table.
const TABLE_COLUMNS = [
  { label: 'Country / Area',      key: 'country_area', className: 'country-cell' },
  { label: 'Published Period',    key: 'published_period' },
  { label: 'Study Year',          key: 'study_year' },
  { label: 'Specialty Name',      key: 'specialty' },
  { label: 'Specialty 1',         key: 'specialty_1' },
  { label: 'Disease Name',        key: 'disease_name', className: 'disease-cell' },
  { label: 'Epidemiology Metric', key: 'epi_metric', className: 'metric-cell' },
  { label: 'Estimate',            key: 'prevalence_estimate_text' },
  { label: 'Epi Value',           key: 'value_estimation', className: 'value-cell' },
  { label: 'Data Source Type',    key: 'data_source_type' },
  { label: 'Date of Update',      key: 'date_of_update' },
];

const EXPORT_COLUMNS = [
  { label: 'Region',                                         key: 'continent' },
  { label: 'Country / Area',                                 key: 'country_area' },
  { label: 'Published period',                               key: 'published_period' },
  { label: 'Study year',                                     key: 'study_year' },
  { label: 'Specialty name',                                 key: 'specialty' },
  { label: 'Specialty 1',                                    key: 'specialty_1' },
  { label: 'Disease name',                                   key: 'disease_name' },
  { label: 'Gender type',                                    key: 'gender_type' },
  { label: 'Age',                                            key: 'age_group' },
  { label: 'Race',                                           key: 'race' },
  { label: 'Ethnicity',                                      key: 'ethnicity' },
  { label: 'Epidemiology metric',                            key: 'epi_metric' },
  { label: 'Estimate (per 10,000 / 100,000 / cases)',        key: 'prevalence_estimate_text' },
  { label: 'Epi value',                                      key: 'value_estimation' },
  { label: 'Study sample size',                              key: 'study_sample_size' },
  { label: 'Study design',                                   key: 'study_design' },
  { label: 'Data source type',                               key: 'data_source_type' },
  { label: 'Reference',                                      key: 'reference' },
  { label: 'URL',                                            key: 'url' },
  { label: 'Date of update',                                 key: 'date_of_update' },
];

export default function PrevalenceIncidence() {
  // Filter options
  const [continents,  setContinents]  = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [diseases,    setDiseases]    = useState([]);
  const [countries,   setCountries]   = useState([]);
  const [metrics,     setMetrics]     = useState([]);
  const [genders,     setGenders]     = useState([]);

  // Selected filters
  const [selContinent, setSelContinent] = useState('');
  const [selSpecialty, setSelSpecialty] = useState('');
  const [selDisease,   setSelDisease]   = useState('');
  const [selCountries, setSelCountries] = useState([]);   // empty = all countries
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

  // ── 1. Load continents and specialties on mount ───────────
  useEffect(() => {
    api.get('/epi/filter-options')
      .then(r => setContinents(r.data.continents || []))
      .catch(() => {});
    api.get('/epi/specialties')
      .then(r => {
        setSpecialties(r.data || []);
        setSelSpecialty(keepIfListed(r.data));
      })
      .catch(() => {});
  }, []);

  // ── 2. Load diseases when specialty or continent changes ──
  useEffect(() => {
    const params = new URLSearchParams();
    if (selSpecialty) params.set('specialty', selSpecialty);
    if (selContinent) params.set('continent', selContinent);
    api.get(`/epi/diseases?${params}`)
      .then(r => {
        setDiseases(r.data || []);
        setSelDisease(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [selSpecialty, selContinent]);

  // ── 3. Load countries when disease changes ────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('disease', selDisease);
    if (selContinent) params.set('continent', selContinent);
    api.get(`/epi/countries?${params}`)
      .then(r => {
        const list = r.data || [];
        setCountries(list);
        // keep ticked countries that are still available (region/disease changed)
        setSelCountries(prev => {
          const kept = prev.filter(c => list.includes(c));
          return kept.length === prev.length ? prev : kept;
        });
      })
      .catch(() => {});
  }, [selDisease, selContinent]);

  // ── 4. Load metrics when country or disease changes ───────
  useEffect(() => {
    const params = new URLSearchParams();
    selCountries.forEach(c => params.append('country', c));
    params.set('disease', selDisease);
    if (selContinent) params.set('continent', selContinent);
    api.get(`/epi/metrics?${params}`)
      .then(r => {
        setMetrics(r.data || []);
        setSelMetric(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [selCountries, selDisease, selContinent]);

  // ── 5. Load genders when country or disease changes ───────
  useEffect(() => {
    const params = new URLSearchParams();
    selCountries.forEach(c => params.append('country', c));
    params.set('disease', selDisease);
    if (selContinent) params.set('continent', selContinent);
    api.get(`/epi/genders?${params}`)
      .then(r => {
        setGenders(r.data || []);
        setSelGender(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [selCountries, selDisease, selContinent]);

  // ── 6. Fetch table data ───────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    const params = new URLSearchParams();
    if (selSpecialty) params.set('specialty',  selSpecialty);
    if (selDisease)   params.set('disease',    selDisease);
    if (selContinent) params.set('continent',  selContinent);
    selCountries.forEach(c => params.append('country', c));
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
  }, [selSpecialty, selDisease, selContinent, selCountries, selGender, selMetric, yearFrom, yearTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Export all columns ────────────────────────────────────
  const handleExport = () => {
    const csvRows = [EXPORT_COLUMNS.map(c => csvCell(c.label)).join(',')];
    tableData.forEach(r => {
      csvRows.push(EXPORT_COLUMNS.map(c => csvCell(cellText(r, c.key))).join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `REED_prevalence_export_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="prev-page">

      {/* ── Top Controls ──────────────────────────────────── */}
      <div className="prev-controls">
        <div className="ctrl-divider" />

        {/* ── Disease specialty + Disease as pills ────────── */}
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

        {/* ── Year range ───────────────────────────────────── */}
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

        {/* ── Sidebar — Region, Country, Metric, Gender ─────── */}
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

          <label className="fl">Epi metric</label>
          <select className="fs" value={selMetric}
            onChange={e => setSelMetric(e.target.value)}>
            <option value="">All metrics</option>
            {metrics.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <label className="fl">Gender</label>
          <select className="fs" value={selGender}
            onChange={e => setSelGender(e.target.value)}>
            <option value="">All genders</option>
            {genders.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <div className="sidebar-count">
            {loading ? '…' : `${tableData.length} record${tableData.length !== 1 ? 's' : ''}`}
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────── */}
        <div className={`prev-main${viewMode === 'table' ? ' has-insights' : ''}`}>
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
            <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {TABLE_COLUMNS.map(c => <th key={c.key}>{c.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={TABLE_COLUMNS.length} className="no-data">
                        No records match the selected filters.
                      </td>
                    </tr>
                  ) : tableData.map((row, i) => (
                    <tr key={i}>
                      {TABLE_COLUMNS.map(c => (
                        <td key={c.key} className={c.className} title={row[c.key]}>
                          {cellText(row, c.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <EpiInsights
              rows={tableData}
              disease={selDisease}
              metric={selMetric}
              defaultMetric="Prevalence"
              groupBy="metric"
              fields={{ value: 'value_estimation', estimate: 'prevalence_estimate_text' }}
            />
            </>
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