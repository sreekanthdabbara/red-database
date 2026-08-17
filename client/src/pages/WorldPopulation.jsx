import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../api/axios';
import './WorldPopulation.css';

const TABS    = ['Gender', 'Age Group', 'Growth Rate'];
const GENDERS = ['Both', 'Male', 'Female'];
const AGE_COLS = [
  { key: 'age_0_4',      label: '0–4' },
  { key: 'age_5_9',      label: '5–9' },
  { key: 'age_10_14',    label: '10–14' },
  { key: 'age_15_19',    label: '15–19' },
  { key: 'age_20_24',    label: '20–24' },
  { key: 'age_25_29',    label: '25–29' },
  { key: 'age_30_34',    label: '30–34' },
  { key: 'age_35_39',    label: '35–39' },
  { key: 'age_40_44',    label: '40–44' },
  { key: 'age_45_49',    label: '45–49' },
  { key: 'age_50_54',    label: '50–54' },
  { key: 'age_55_59',    label: '55–59' },
  { key: 'age_60_64',    label: '60–64' },
  { key: 'age_65_69',    label: '65–69' },
  { key: 'age_70_74',    label: '70–74' },
  { key: 'age_75_79',    label: '75–79' },
  { key: 'age_80_84',    label: '80–84' },
  { key: 'age_85_89',    label: '85–89' },
  { key: 'age_90_94',    label: '90–94' },
  { key: 'age_95_99',    label: '95–99' },
  { key: 'age_100_plus', label: '100+' },
];

const CHART_COLORS = [
  '#0F7B6C', '#18A092', '#C9924A', '#10b981',
  '#8b5cf6', '#E8394A', '#f59e0b', '#3b82f6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

// ── Pivot gender/growth — rows per year → years as columns ───
function pivotByYear(data, valueKey) {
  const years = [...new Set(data.map(r => r.year))].sort((a, b) => a - b);
  const grouped = {};
  data.forEach(row => {
    const key = `${row.country}||${row.region}||${row.sub_region}||${row.type}||${row.gender}`;
    if (!grouped[key]) {
      grouped[key] = {
        country:    row.country,
        region:     row.region,
        sub_region: row.sub_region,
        type:       row.type,
        gender:     row.gender,
      };
    }
    grouped[key][row.year] = row[valueKey];
  });
  return { rows: Object.values(grouped), years };
}

// ── Pivot age — age groups as rows, years as columns ─────────
function pivotAgeByYear(data) {
  const years = [...new Set(data.map(r => r.year))].sort((a, b) => a - b);
  const grouped = {};

  data.forEach(row => {
    const key = `${row.country}||${row.region}||${row.gender}`;
    if (!grouped[key]) {
      grouped[key] = {
        country: row.country,
        region:  row.region,
        gender:  row.gender,
        byYear:  {},
      };
    }
    grouped[key].byYear[row.year] = row;
  });

  const rows = [];
  Object.values(grouped).forEach(group => {
    AGE_COLS.forEach(col => {
      const row = {
        country:  group.country,
        region:   group.region,
        gender:   group.gender,
        ageGroup: col.label,
        ageKey:   col.key,
      };
      years.forEach(y => {
        row[y] = group.byYear[y] ? group.byYear[y][col.key] : null;
      });
      rows.push(row);
    });
  });

  return { rows, years };
}

// ── Build age chart data ──────────────────────────────────────
function buildAgeChartData(pivotedAge) {
  return pivotedAge.years.map(y => {
    const point = { year: y };
    const firstGroupRows = AGE_COLS.map(col =>
      pivotedAge.rows.find(r => r.ageGroup === col.label)
    );
    firstGroupRows.forEach(r => {
      if (r) point[r.ageGroup] = r[y] != null ? parseFloat(r[y]) : null;
    });
    return point;
  });
}

export default function WorldPopulation() {
  const [activeTab, setActiveTab] = useState('Gender');
  const [viewMode,  setViewMode]  = useState('table');

  // Filter options
  const [countries, setCountries] = useState([]);
  const [regions,   setRegions]   = useState([]);

  // Selected filters
  const [selCountry, setSelCountry] = useState('');
  const [selRegion,  setSelRegion]  = useState('');
  const [selGender,  setSelGender]  = useState('Both');
  const [yearFrom,   setYearFrom]   = useState(2024);
  const [yearTo,     setYearTo]     = useState(2050);

  // Data
  const [genderData, setGenderData] = useState([]);
  const [ageData,    setAgeData]    = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // ── 1. Load regions on mount ──────────────────────────────
  useEffect(() => {
    api.get('/population/filter-options')
      .then(r => setRegions(r.data.regions || []))
      .catch(() => {});
  }, []);

  // ── 2. Load countries when region changes ─────────────────
  useEffect(() => {
    const url = selRegion
      ? `/population/countries?region=${encodeURIComponent(selRegion)}`
      : '/population/countries';
    api.get(url)
      .then(r => {
        setCountries(r.data || []);
        setSelCountry(r.data?.[0] || '');
      })
      .catch(() => {});
  }, [selRegion]);

  // ── 3. Fetch data ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true); setError('');

    const params = new URLSearchParams();
    if (selCountry) params.set('country', selCountry);
    if (selRegion)  params.set('region',  selRegion);

    // Gender — Growth Rate always uses Both
    if (activeTab === 'Growth Rate') {
      params.set('gender', 'Both');
    } else {
      if (selGender) params.set('gender', selGender);
    }

    params.set('year_from', yearFrom);
    params.set('year_to',   yearTo);

    const ageParams = new URLSearchParams();
    if (selCountry) ageParams.set('country',   selCountry);
    if (selRegion)  ageParams.set('region',    selRegion);
    if (selGender)  ageParams.set('gender',    selGender);
    ageParams.set('year_from', yearFrom);
    ageParams.set('year_to',   yearTo);

    try {
      const [genderRes, ageRes, growthRes] = await Promise.all([
        api.get(`/population/gender?${params}`),
        api.get(`/population/age?${ageParams}`),
        api.get(`/population/growth?${params}`),
      ]);
      setGenderData(genderRes.data);
      setAgeData(ageRes.data);
      setGrowthData(growthRes.data);
    } catch {
      setError('Failed to load population data.');
    } finally {
      setLoading(false);
    }
  }, [selCountry, selRegion, selGender, activeTab, yearFrom, yearTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Pivot data
  const pivotedGender = useMemo(() => pivotByYear(genderData, 'cases'),       [genderData]);
  const pivotedGrowth = useMemo(() => pivotByYear(growthData, 'growth_rate'), [growthData]);
  const pivotedAge    = useMemo(() => pivotAgeByYear(ageData),                [ageData]);
  const ageChartData  = useMemo(() => buildAgeChartData(pivotedAge),          [pivotedAge]);

  const handleExport = () => {
    let rows = [], headers = [];
    if (activeTab === 'Gender') {
      const { rows: pRows, years: pYears } = pivotedGender;
      headers = ['Country', 'Region', 'Sub-region', 'Type', 'Gender',
        ...pYears.map(y => `${y} Cases`)];
      rows = pRows.map(r => [r.country, r.region, r.sub_region, r.type, r.gender,
        ...pYears.map(y => r[y] ?? '')]);
    } else if (activeTab === 'Age Group') {
      const { rows: pRows, years: pYears } = pivotedAge;
      headers = ['Country', 'Region', 'Gender', 'Age Group',
        ...pYears.map(y => String(y))];
      rows = pRows.map(r => [r.country, r.region, r.gender, r.ageGroup,
        ...pYears.map(y => r[y] ?? '')]);
    } else {
      const { rows: pRows, years: pYears } = pivotedGrowth;
      headers = ['Country', 'Region', 'Sub-region', 'Type', 'Gender',
        ...pYears.map(y => `${y} %`)];
      rows = pRows.map(r => [r.country, r.region, r.sub_region, r.type, r.gender,
        ...pYears.map(y => r[y] ?? '')]);
    }
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `REED_population_${activeTab.replace(' ', '_')}_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="wp-page">

      {/* ── Controls ──────────────────────────────────────── */}
      <div className="wp-controls">
        <div className="wp-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`wp-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="wp-year-range">
          <span className="year-clean-label">Year range</span>
          <div className="year-clean-row">
            <span className="year-arrow">←</span>
            <div
              className="year-track"
              style={{
                background: `linear-gradient(to right,
                  #E8EAF0 0%,
                  #E8EAF0 ${((yearFrom - 2024) / (2100 - 2024)) * 100}%,
                  #0F7B6C ${((yearFrom - 2024) / (2100 - 2024)) * 100}%,
                  #0F7B6C ${((yearTo   - 2024) / (2100 - 2024)) * 100}%,
                  #E8EAF0 ${((yearTo   - 2024) / (2100 - 2024)) * 100}%,
                  #E8EAF0 100%)`,
              }}
            >
              <input type="range" min={2024} max={yearTo}   value={yearFrom}
                onChange={e => setYearFrom(+e.target.value)} />
              <input type="range" min={yearFrom} max={2100} value={yearTo}
                onChange={e => setYearTo(+e.target.value)} />
            </div>
            <span className="year-arrow">→</span>
          </div>
          <div className="year-clean-nums">
            <span>{yearFrom}</span>
            <span>{yearTo}</span>
          </div>
        </div>

        <div className="wp-actions">
          <button className="btn-dl" onClick={handleExport}>⬇ Download</button>
        </div>
      </div>

      <div className="wp-body">

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside className="wp-sidebar">
          <h3 className="sidebar-title">Selections</h3>

          <label className="fl">Region</label>
          <select className="fs" value={selRegion}
            onChange={e => setSelRegion(e.target.value)}>
            <option value="">All regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <label className="fl">Country</label>
          <select className="fs" value={selCountry}
            onChange={e => setSelCountry(e.target.value)}>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Gender — hidden for Growth Rate (only Both available) */}
          {activeTab !== 'Growth Rate' && (
            <>
              <label className="fl">Gender</label>
              <select className="fs" value={selGender}
                onChange={e => setSelGender(e.target.value)}>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </>
          )}

          <div className="sidebar-count">
            {loading ? '…' : activeTab === 'Gender'
              ? `${pivotedGender.rows.length} records`
              : activeTab === 'Age Group'
              ? `${pivotedAge.rows.length} records`
              : `${pivotedGrowth.rows.length} records`
            }
          </div>
        </aside>

        {/* ── Main ──────────────────────────────────────────── */}
        <div className="wp-main">
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

              {/* ── Gender Table ───────────────────────────── */}
              {activeTab === 'Gender' && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Region</th>
                      <th>Sub-region</th>
                      <th>Type</th>
                      <th>Gender</th>
                      {pivotedGender.years.map(y => <th key={y}>{y}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {pivotedGender.rows.length === 0 ? (
                      <tr><td colSpan={6} className="no-data">No data for selected filters.</td></tr>
                    ) : pivotedGender.rows.map((row, i) => (
                      <tr key={i}>
                        <td className="country-cell" title={row.country}>{row.country}</td>
                        <td title={row.region}>{row.region}</td>
                        <td title={row.sub_region}>{row.sub_region}</td>
                        <td title={row.type}>{row.type}</td>
                        <td title={row.gender}>{row.gender}</td>
                        {pivotedGender.years.map(y => (
                          <td key={y} className="value-cell"
                            title={row[y] != null ? Number(row[y]).toLocaleString() : '—'}>
                            {row[y] != null
                              ? Number(row[y]).toLocaleString(undefined, { maximumFractionDigits: 0 })
                              : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ── Age Group Table ────────────────────────── */}
              {activeTab === 'Age Group' && (
                <table className="data-table age-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Region</th>
                      <th>Gender</th>
                      <th>Age Group</th>
                      {pivotedAge.years.map(y => <th key={y}>{y}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {pivotedAge.rows.length === 0 ? (
                      <tr><td colSpan={5} className="no-data">No data for selected filters.</td></tr>
                    ) : pivotedAge.rows.map((row, i) => (
                      <tr key={i}>
                        <td className="country-cell" title={row.country}>{row.country}</td>
                        <td title={row.region}>{row.region}</td>
                        <td title={row.gender}>{row.gender}</td>
                        <td title={row.ageGroup}>{row.ageGroup}</td>
                        {pivotedAge.years.map(y => (
                          <td key={y} className="value-cell"
                            title={row[y] != null
                              ? Number(row[y]).toLocaleString(undefined, { maximumFractionDigits: 0 })
                              : '—'}>
                            {row[y] != null
                              ? Number(row[y]).toLocaleString(undefined, { maximumFractionDigits: 0 })
                              : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* ── Growth Rate Table ──────────────────────── */}
              {activeTab === 'Growth Rate' && (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Region</th>
                      <th>Sub-region</th>
                      <th>Type</th>
                      <th>Gender</th>
                      {pivotedGrowth.years.map(y => <th key={y}>{y} %</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {pivotedGrowth.rows.length === 0 ? (
                      <tr><td colSpan={6} className="no-data">No data for selected filters.</td></tr>
                    ) : pivotedGrowth.rows.map((row, i) => (
                      <tr key={i}>
                        <td className="country-cell" title={row.country}>{row.country}</td>
                        <td title={row.region}>{row.region}</td>
                        <td title={row.sub_region}>{row.sub_region}</td>
                        <td title={row.type}>{row.type}</td>
                        <td title={row.gender}>{row.gender}</td>
                        {pivotedGrowth.years.map(y => (
                          <td key={y}
                            className={`value-cell${row[y] != null && row[y] < 0 ? ' negative' : ''}`}
                            title={row[y] != null ? `${row[y]}%` : '—'}>
                            {row[y] != null ? `${row[y]}%` : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          ) : (

            /* ── CHART VIEWS ────────────────────────────────── */
            <div className="chart-wrapper">

              {activeTab === 'Gender' && (
                <>
                  <h3 className="chart-title">
                    Population Cases Over Time — {selCountry || 'Global'}
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={genderData}
                      margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickFormatter={v => (v / 1000).toFixed(0) + 'M'} />
                      <Tooltip
                        formatter={v => [Number(v).toLocaleString(), 'Cases (thousands)']}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8EAF0' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="cases" stroke="#0F7B6C"
                        strokeWidth={2} dot={false} name="Population" />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}

              {activeTab === 'Age Group' && (
                <>
                  <h3 className="chart-title">
                    Population by Age Group Over Time — {selCountry || 'Global'} ({yearFrom}–{yearTo})
                  </h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={ageChartData}
                      margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickFormatter={v => (v / 1000).toFixed(0) + 'K'} />
                      <Tooltip
                        formatter={(v, name) => [
                          v != null ? Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '—',
                          name,
                        ]}
                        contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E8EAF0' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {AGE_COLS.map((col, i) => (
                        <Line
                          key={col.key}
                          type="monotone"
                          dataKey={col.label}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          strokeWidth={1.5}
                          dot={false}
                          name={col.label}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="chart-note">
                    <em>Note: Showing first selected country/gender combination</em>
                  </p>
                </>
              )}

              {activeTab === 'Growth Rate' && (
                <>
                  <h3 className="chart-title">
                    Population Growth Rate Over Time — {selCountry || 'Global'}
                  </h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={growthData}
                      margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#6B7280' }}
                        tickFormatter={v => v + '%'} />
                      <Tooltip
                        formatter={v => [v + '%', 'Growth Rate']}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8EAF0' }}
                      />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="growth_rate" stroke="#0F7B6C"
                        strokeWidth={2} dot={false} name="Growth Rate %" />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="chart-note">
                    <em>Negative values indicate population decline</em>
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}