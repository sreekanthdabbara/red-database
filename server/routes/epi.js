const router = require('express').Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// ── GET /api/epi  — filtered list ────────────────────────────
router.get('/', auth, async (req, res) => {
  const { disease, country, gender, epi_metric, year_from, year_to, search, continent } = req.query;

  let sql = 'SELECT * FROM epi_data WHERE 1=1';
  const params = [];

  if (disease) { sql += ' AND disease_name = ?'; params.push(disease); }
  if (continent) { sql += ' AND continent = ?'; params.push(continent); }
  if (country) { sql += ' AND country_area LIKE ?'; params.push(`%${country}%`); }
  if (gender && gender !== 'All') { sql += ' AND gender_type = ?'; params.push(gender); }
  if (epi_metric) { sql += ' AND epi_metric = ?'; params.push(epi_metric); }
  if (year_from) { sql += ' AND CAST(published_period AS UNSIGNED) >= ?'; params.push(Number(year_from)); }
  if (year_to) { sql += ' AND CAST(published_period AS UNSIGNED) <= ?'; params.push(Number(year_to)); }
  if (search) {
    sql += ' AND (disease_name LIKE ? OR country_area LIKE ? OR epi_metric LIKE ? OR reference LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  sql += ' ORDER BY published_period DESC, country_area ASC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/epi/chart/by-country ────────────────────────────
// Returns one row per country (highest estimate) for bar chart
router.get('/chart/by-country', auth, async (req, res) => {
  const { disease, gender, epi_metric } = req.query;
  let sql = `
    SELECT country_area, published_period, epi_metric,
           MAX(value_estimation) AS estimate
    FROM epi_data WHERE value_estimation IS NOT NULL
  `;
  const params = [];
  if (disease) { sql += ' AND disease_name = ?'; params.push(disease); }
  if (gender && gender !== 'All') { sql += ' AND gender_type = ?'; params.push(gender); }
  if (epi_metric) { sql += ' AND epi_metric = ?'; params.push(epi_metric); }
  sql += ' GROUP BY country_area, published_period, epi_metric ORDER BY estimate DESC LIMIT 20';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/epi/filter-options  — distinct values for dropdowns
router.get('/filter-options', auth, async (req, res) => {
  try {
    const [[diseases], [countries], [metrics], [genders], [continents]] = await Promise.all([
      db.query('SELECT DISTINCT disease_name FROM epi_data ORDER BY disease_name'),
      db.query('SELECT DISTINCT country_area FROM epi_data ORDER BY country_area'),
      db.query('SELECT DISTINCT epi_metric FROM epi_data ORDER BY epi_metric'),
      db.query('SELECT DISTINCT gender_type FROM epi_data ORDER BY gender_type'),
      db.query('SELECT DISTINCT continent FROM epi_data WHERE continent IS NOT NULL ORDER BY continent'),
    ]);
    res.json({
      diseases: diseases.map(r => r.disease_name),
      countries: countries.map(r => r.country_area),
      metrics: metrics.map(r => r.epi_metric),
      genders: genders.map(r => r.gender_type),
      continents: continents.map(r => r.continent),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
