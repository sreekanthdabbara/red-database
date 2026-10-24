// Chart + summary panel shown under the table (Incidence, Prevalence pages).
// One bar per record. groupBy="reference": each bar its own colour, legend
// "Reference 1, 2…". groupBy="metric": bars coloured and labelled by epi metric.
// Summary comes from Definitions (category "Disease").
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import api from '../api/axios';
import './EpiInsights.css';

const MAX_BARS = 10;
const BAR_COLORS = [
  '#1B2A6B', '#E06666', '#F2C14E', '#0F7B6C', '#8B5CF6',
  '#3B82F6', '#EC4899', '#F97316', '#14B8A6', '#6B7280',
];

// Optional partner logo: drop the file into client/public to show it
const LOGO_SRC = '/episcience-logo.png';

const unique = (values) => [...new Set(values.filter(Boolean))];
const onlyOne = (values) => { const u = unique(values); return u.length === 1 ? u[0] : null; };

// "6.67 per 100,000 live births" → "per 100,000"; "%" → "%"
const unitOf = (text) => {
  const t = String(text ?? '');
  if (t.includes('%')) return '%';
  return t.match(/per\s*[\d,]+/i)?.[0].replace(/per\s*/i, 'per ') ?? null;
};

const DEFAULT_FIELDS = { value: 'epi_value', estimate: 'estimate', metric: 'epi_metric' };

export default function EpiInsights({
  rows, disease, metric,
  defaultMetric = 'Incidence',   // title word when records mix metrics
  groupBy = 'reference',         // 'reference' | 'metric'
  fields = {},                   // column names when they differ from DEFAULT_FIELDS
}) {
  const f = { ...DEFAULT_FIELDS, ...fields };
  const [definitions, setDefinitions] = useState([]);
  const [showLogo,    setShowLogo]    = useState(true);

  useEffect(() => {
    api.get('/definitions')
      .then(r => setDefinitions(r.data || []))
      .catch(() => {});
  }, []);

  const charted = rows.filter(r => !isNaN(parseFloat(r[f.value])));
  const shown = (groupBy === 'metric'
    ? [...charted].sort((a, b) => String(a[f.metric]).localeCompare(String(b[f.metric])))
    : charted
  ).slice(0, MAX_BARS);

  // Legend entries: one per bar (reference) or one per metric
  const groups = groupBy === 'metric'
    ? unique(shown.map(r => r[f.metric] || 'Unspecified'))
    : shown.map((_, i) => `Reference ${i + 1}`);
  const colorOf = (label) => BAR_COLORS[groups.indexOf(label) % BAR_COLORS.length];

  const bars = shown.map((r, i) => ({
    name:      groupBy === 'metric' ? (r[f.metric] || 'Unspecified') : `Reference ${i + 1}`,
    value:     parseFloat(r[f.value]),
    reference: r.reference,
    country:   r.country_area,
    year:      r.published_period,
    estimate:  r[f.estimate],
  }));

  // "Fabry disease, Prevalence per 100,000 population" / "Fabry disease, Genetic testing rate, %"
  const diseaseName = disease || onlyOne(rows.map(r => r.disease_name)) || 'All diseases';
  const metricName  = metric  || onlyOne(rows.map(r => r[f.metric]))   || defaultMetric;
  const unit        = onlyOne(rows.map(r => unitOf(r[f.estimate])));
  const title = `${diseaseName}, ${metricName}${
    unit === '%' ? ', %' : unit ? ` ${unit} population` : ''
  }`;

  const summary = definitions.find(d =>
    d.term?.toLowerCase() === diseaseName.toLowerCase()
  )?.definition;

  return (
    <div className="insights">
      <div className="insights-chart">
        <h3 className="insights-title">{title}</h3>

        {bars.length === 0 ? (
          <div className="insights-empty">No values to chart for the current filters.</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bars} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#E8EAF0" />
                <XAxis dataKey="name" hide />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(15, 123, 108, 0.06)' }}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8EAF0' }}
                  // Prevalence estimate text already has the number ("6.67 per 100,000…"); Incidence's is just the unit
                  formatter={(v, _, p) => {
                    const est = p.payload.estimate || '';
                    return [/\d/.test(est) ? est : est === '%' ? `${v}%` : `${v} ${est}`.trim(), p.payload.name];
                  }}
                  labelFormatter={(_, p) => {
                    const b = p?.[0]?.payload;
                    return b ? `${b.reference || 'Unknown source'} — ${b.country} (${b.year})` : '';
                  }}
                />
                <Bar dataKey="value" maxBarSize={90}>
                  {bars.map((b, i) => <Cell key={i} fill={colorOf(b.name)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="insights-footer">
              {showLogo && (
                <img className="insights-logo" src={LOGO_SRC} alt="" onError={() => setShowLogo(false)} />
              )}
              <ul className="insights-legend">
                {groups.map(label => (
                  <li key={label}>
                    <span className="swatch" style={{ background: colorOf(label) }} />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {charted.length > MAX_BARS && (
              <p className="insights-note">
                Showing the first {MAX_BARS} of {charted.length} records — narrow the filters to compare specific studies.
              </p>
            )}
          </>
        )}
      </div>

      <aside className="insights-summary">
        <h3>Summary</h3>
        {summary ? (
          <p>{summary}</p>
        ) : (
          <p className="insights-muted">
            {disease
              ? `No summary for ${disease} yet. Add one under Definitions with the category "Disease".`
              : 'Select a disease to see its summary.'}
          </p>
        )}
      </aside>
    </div>
  );
}
