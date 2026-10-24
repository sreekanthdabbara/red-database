import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../api/axios';
import MultiSelect from '../components/MultiSelect';
import EpiInsights from '../components/EpiInsights';
import './Survival.css';

// Keep the current choice if the reloaded list still has it, else fall back to "All" ('')
const keepIfListed = (list) => (prev) => ((list || []).includes(prev) ? prev : '');

export default function Survival() {
  // Filter options
  const [continents,    setContinents]    = useState([]);
  const [countries,     setCountries]     = useState([]);
  const [specialties,   setSpecialties]   = useState([]);
  const [diseases,      setDiseases]      = useState([]);
  const [genders,       setGenders]       = useState([]);
  const [survivalTypes, setSurvivalTypes] = useState([]);
  const [yearTypes,     setYearTypes]     = useState([]);

  // Selected filters
  const [selContinent, setSelContinent] = useState('');
  const [selCountries, setSelCountries] = useState([]);   // empty = all countries
  const [selSpecialty, setSelSpecialty] = useState('');
  const [selDisease,   setSelDisease]   = useState('');
  const [selGender,    setSelGender]    = useState('');
  const [selSurvType,  setSelSurvType]  = useState('');
  const [selYearType,  setSelYearType]  = useState('');
  const [yearFrom,     setYearFrom]     = useState(1990);
  const [yearTo,       setYearTo]       = useState(2026);

  // Data
  const [tableData, setTableData] = useState([]);
  const [viewMode,  setViewMode]  = useState('table');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  // ── 1. Load continents on mount ───────────────────────────
  useEffect(() => {
    api.get('/survival/filter-options')
      .then(r => setContinents(r.data.continents || []))
      .catch(() => {});
  }, []);

  // ── 2. Load countries when continent changes ──────────────
  useEffect(() => {
    const url = selContinent
      ? `/survival/countries?continent=${encodeURIComponent(selContinent)}`
      : '/survival/countries';
    api.get(url)
      .then(r => {
        setCountries(r.data || []);
        setSelCountries([]);
      })
      .catch(() => {});
  }, [selContinent]);

  // ── 3. Load specialties when country changes ──────────────
  useEffect(() => {
    const params = new URLSearchParams();
    selCountries.forEach(c => params.append('country', c));
    if (selContinent) params.set('continent', selContinent);
    api.get(`/survival/specialties?${params}`)
      .then(r => {
        setSpecialties(r.data || []);
        setSelSpecialty(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [selCountries, selContinent]);

  // ── 4. Load diseases when specialty or country changes ────
  useEffect(() => {
    const params = new URLSearchParams();
    selCountries.forEach(c => params.append('country', c));
    if (selSpecialty) params.set('specialty', selSpecialty);
    if (selContinent) params.set('continent', selContinent);
    api.get(`/survival/diseases?${params}`)
      .then(r => {
        setDiseases(r.data || []);
        setSelDisease(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [selCountries, selSpecialty, selContinent]);

  // ── 5. Load genders when disease changes ──────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('disease', selDisease);
    selCountries.forEach(c => params.append('country', c));
    if (selContinent) params.set('continent', selContinent);
    api.get(`/survival/genders?${params}`)
      .then(r => {
        setGenders(r.data || []);
        setSelGender(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [selDisease, selCountries, selContinent]);

  // ── 6. Load survival types when gender changes ────────────
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('disease', selDisease);
    selCountries.forEach(c => params.append('country', c));
    if (selContinent) params.set('continent', selContinent);
    if (selGender)    params.set('gender',    selGender);
    api.get(`/survival/survival-types?${params}`)
      .then(r => {
        setSurvivalTypes(r.data || []);
        setSelSurvType(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [selDisease, selCountries, selContinent, selGender]);

  // ── 7. Load year types when survival type changes ─────────
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('disease', selDisease);
    selCountries.forEach(c => params.append('country', c));
    if (selContinent) params.set('continent',     selContinent);
    if (selGender)    params.set('gender',        selGender);
    if (selSurvType)  params.set('survival_type', selSurvType);
    api.get(`/survival/year-types?${params}`)
      .then(r => {
        setYearTypes(r.data || []);
        setSelYearType(keepIfListed(r.data));
      })
      .catch(() => {});
  }, [selDisease, selCountries, selContinent, selGender, selSurvType]);

  // ── 8. Fetch table data ───────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    const params = new URLSearchParams();
    if (selContinent) params.set('continent',        selContinent);
    selCountries.forEach(c => params.append('country', c));
    if (selSpecialty) params.set('specialty',        selSpecialty);
    if (selDisease)   params.set('disease',          selDisease);
    if (selGender)    params.set('gender',           selGender);
    if (selSurvType)  params.set('survival_type',    selSurvType);
    if (selYearType)  params.set('year_of_survival', selYearType);
    params.set('year_from', yearFrom);
    params.set('year_to',   yearTo);

    try {
      const res = await api.get(`/survival?${params}`);
      setTableData(res.data);
    } catch {
      setError('Failed to load survival data.');
    } finally {
      setLoading(false);
    }
  }, [selContinent, selCountries, selSpecialty, selDisease, selGender, selSurvType, selYearType, yearFrom, yearTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Chart data ────────────────────────────────────────────
  const chartData = tableData
    .filter(r => r.estimate)
    .slice(0, 20)
    .map(r => ({
      name:     `${r.country_area} (${r.published_period})`,
      value:    1,
      label:    `${r.survival_type} — ${r.year_of_survival}`,
      estimate: r.estimate,
    }));

  // ── Export all columns ────────────────────────────────────
  const handleExport = () => {
    const headers = [
      'Region', 'Sub-region', 'Country / Area', 'Published period',
      'Study year', 'Specialty name', 'Specialty 1', 'Disease name',
      'Another name of disease', 'Synonym(s)', 'ICD code', 'Disease ICD code',
      'Disease definition', 'Gender type', 'Age', 'Race', 'Ethnicity',
      'Survival type', 'Year of survival', 'Estimate', 'Epi value',
      'Study sample type', 'Study design', 'Data source type',
      'Reference', 'URL', 'Date of update',
    ];
    const csvRows = [headers.join(',')];
    tableData.forEach(r => {
      csvRows.push([
        r.region || '',
        r.sub_region || '',
        r.country_area || '',
        r.published_period || '',
        r.study_year || '',
        r.specialty_name || '',
        r.specialty_name || '',
        r.disease_name || '',
        `"${(r.another_name || '').replace(/"/g, '""')}"`,
        `"${(r.synonyms || '').replace(/"/g, '""')}"`,
        r.icd_code || '',
        r.disease_icd_code || '',
        `"${(r.disease_definition || '').replace(/"/g, '""')}"`,
        r.gender_type || '',
        r.age_group || '',
        r.race || '',
        r.ethnicity || '',
        r.survival_type || '',
        r.year_of_survival || '',
        r.estimate || '',
        r.epi_value || '',
        `"${(r.study_sample_type || '').replace(/"/g, '""')}"`,
        `"${(r.study_design || '').replace(/"/g, '""')}"`,
        r.data_source_type || '',
        `"${(r.reference || '').replace(/"/g, '""')}"`,
        r.url || '',
        (r.date_of_update || r.created_at) ? new Date(r.date_of_update || r.created_at).toLocaleDateString() : '',
      ].join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `REED_survival_export_${Date.now()}.csv`;
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

          <label className="fl">Survival type</label>
          <select className="fs" value={selSurvType}
            onChange={e => setSelSurvType(e.target.value)}>
            <option value="">All types</option>
            {survivalTypes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <label className="fl">Year of survival</label>
          <select className="fs" value={selYearType}
            onChange={e => setSelYearType(e.target.value)}>
            <option value="">All</option>
            {yearTypes.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <div className="sidebar-count">
            {loading ? '…' : `${tableData.length} record${tableData.length !== 1 ? 's' : ''}`}
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────── */}
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
            {/* ── TABLE — selected columns only ───────────────── */}
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Region</th>
                    <th>Sub-region</th>
                    <th>Country / Area</th>
                    <th>Published Period</th>
                    <th>Study Year</th>
                    <th>Specialty Name</th>
                    <th>Disease Name</th>
                    <th>Survival Type</th>
                    <th>Year of Survival</th>
                    <th>Estimate</th>
                    <th>Epi Value</th>
                    <th>Data Source</th>
                    <th>Reference</th>
                    <th>Date of Update</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="no-data">
                        No records match the selected filters.
                      </td>
                    </tr>
                  ) : tableData.map((row, i) => (
                    <tr key={i}>
                      <td title={row.region}>{row.region}</td>
                      <td title={row.sub_region}>{row.sub_region}</td>
                      <td className="country-cell" title={row.country_area}>{row.country_area}</td>
                      <td title={row.published_period}>{row.published_period}</td>
                      <td title={row.study_year}>{row.study_year}</td>
                      <td title={row.specialty_name}>{row.specialty_name}</td>
                      <td className="disease-cell" title={row.disease_name}>{row.disease_name}</td>
                      <td title={row.survival_type}>{row.survival_type}</td>
                      <td title={row.year_of_survival}>{row.year_of_survival}</td>
                      <td title={row.estimate}>{row.estimate}</td>
                      <td className="value-cell" title={row.epi_value}>{row.epi_value}</td>
                      <td title={row.data_source_type}>{row.data_source_type}</td>
                      <td className="ref-cell" title={row.reference}>{row.reference}</td>
                      <td title={row.date_of_update || row.created_at}>
                        {(row.date_of_update || row.created_at)
                          ? new Date(row.date_of_update || row.created_at).toLocaleDateString()
                          : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <EpiInsights
              rows={tableData}
              disease={selDisease}
              metric="Survival rate"
              fields={{ metric: 'survival_type' }}
            />
            </>
          ) : (

            /* ── CHART ───────────────────────────────────────── */
            <div className="chart-wrapper">
              <h3 className="chart-title">
                {selDisease || 'All Diseases'} — Survival Estimates by Country
              </h3>
              {chartData.length === 0 ? (
                <div className="no-data">No chart data for current filters.</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 44)}>
                  <BarChart
                    data={tableData.slice(0, 20).map(r => ({
                      name:  `${r.country_area} (${r.published_period})`,
                      label: `${r.survival_type} — ${r.year_of_survival}`,
                      est:   r.estimate,
                      value: 1,
                    }))}
                    layout="vertical"
                    margin={{ left: 200, right: 60, top: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E8EAF0" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name"
                      tick={{ fontSize: 11, fill: '#374151' }} width={195} />
                    <Tooltip
                      formatter={(_, __, p) => [
                        `${p.payload.est} (${p.payload.label})`,
                        'Survival'
                      ]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8EAF0' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {tableData.slice(0, 20).map((_, i) => (
                        <Cell key={i} fill={i % 2 === 0 ? '#0F7B6C' : '#18A092'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              <p className="chart-note">
                <em>Note: Displays survival estimates for selected filters</em>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}