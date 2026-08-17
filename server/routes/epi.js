const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

// ── GET /api/epi — filtered list ─────────────────────────────
router.get('/', auth, async (req, res) => {
  const { disease, country, gender, epi_metric, year_from, year_to, search, continent } = req.query;

  let sql = 'SELECT * FROM epi_data WHERE 1=1';
  const params = [];

  if (disease)    { sql += ' AND disease_name = ?';                        params.push(disease); }
  if (continent)  { sql += ' AND continent = ?';                           params.push(continent); }
  if (country)    { sql += ' AND country_area = ?';                        params.push(country); }
  if (gender)     { sql += ' AND gender_type = ?';                         params.push(gender); }
  if (epi_metric) { sql += ' AND epi_metric = ?';                          params.push(epi_metric); }
  if (year_from)  { sql += ' AND CAST(published_period AS UNSIGNED) >= ?'; params.push(Number(year_from)); }
  if (year_to)    { sql += ' AND CAST(published_period AS UNSIGNED) <= ?'; params.push(Number(year_to)); }
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
router.get('/chart/by-country', auth, async (req, res) => {
  const { disease, gender, epi_metric, continent, country } = req.query;
  let sql = `
    SELECT country_area, published_period, epi_metric,
           MAX(value_estimation) AS estimate
    FROM epi_data WHERE value_estimation IS NOT NULL
  `;
  const params = [];
  if (disease)    { sql += ' AND disease_name = ?';   params.push(disease); }
  if (continent)  { sql += ' AND continent = ?';       params.push(continent); }
  if (country)    { sql += ' AND country_area = ?';    params.push(country); }
  if (gender)     { sql += ' AND gender_type = ?';     params.push(gender); }
  if (epi_metric) { sql += ' AND epi_metric = ?';      params.push(epi_metric); }
  sql += ' GROUP BY country_area, published_period, epi_metric ORDER BY estimate DESC LIMIT 20';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/epi/countries?continent=Europe ───────────────────
router.get('/countries', auth, async (req, res) => {
  const { continent } = req.query;
  let sql = 'SELECT DISTINCT country_area FROM epi_data WHERE 1=1';
  const params = [];
  if (continent) { sql += ' AND continent = ?'; params.push(continent); }
  sql += ' ORDER BY country_area';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.country_area));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/epi/diseases?country=Japan ───────────────────────
router.get('/diseases', auth, async (req, res) => {
  const { country, continent } = req.query;
  let sql = 'SELECT DISTINCT disease_name FROM epi_data WHERE 1=1';
  const params = [];
  if (country)   { sql += ' AND country_area = ?'; params.push(country); }
  if (continent) { sql += ' AND continent = ?';    params.push(continent); }
  sql += ' ORDER BY disease_name';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.disease_name));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/epi/metrics?country=Japan&disease=Achondroplasia ─
router.get('/metrics', auth, async (req, res) => {
  const { country, continent, disease } = req.query;
  let sql = 'SELECT DISTINCT epi_metric FROM epi_data WHERE 1=1';
  const params = [];
  if (country)   { sql += ' AND country_area = ?';  params.push(country); }
  if (continent) { sql += ' AND continent = ?';     params.push(continent); }
  if (disease)   { sql += ' AND disease_name = ?';  params.push(disease); }
  sql += ' ORDER BY epi_metric';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.epi_metric));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/epi/genders?country=Japan&disease=Achondroplasia ─
router.get('/genders', auth, async (req, res) => {
  const { country, continent, disease } = req.query;
  let sql = 'SELECT DISTINCT gender_type FROM epi_data WHERE 1=1';
  const params = [];
  if (country)   { sql += ' AND country_area = ?';  params.push(country); }
  if (continent) { sql += ' AND continent = ?';     params.push(continent); }
  if (disease)   { sql += ' AND disease_name = ?';  params.push(disease); }
  sql += ' ORDER BY gender_type';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.gender_type));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/epi/filter-options ───────────────────────────────
router.get('/filter-options', auth, async (req, res) => {
  try {
    const [[continents]] = await Promise.all([
      db.query('SELECT DISTINCT continent FROM epi_data WHERE continent IS NOT NULL ORDER BY continent'),
    ]);
    res.json({
      continents: continents.map(r => r.continent),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;