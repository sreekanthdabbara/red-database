const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

// ── GET /api/genetic-testing/filter-options ──────────────────
router.get('/filter-options', auth, async (req, res) => {
  try {
    const [[continents]] = await Promise.all([
      db.query('SELECT DISTINCT continent FROM genetic_testing_data WHERE continent IS NOT NULL ORDER BY continent'),
    ]);
    res.json({
      continents: continents.map(r => r.continent),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/genetic-testing/countries ───────────────────────
router.get('/countries', auth, async (req, res) => {
  const { continent } = req.query;
  let sql = 'SELECT DISTINCT country_area FROM genetic_testing_data WHERE 1=1';
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

// ── GET /api/genetic-testing/specialties ─────────────────────
router.get('/specialties', auth, async (req, res) => {
  const { country, continent } = req.query;
  let sql = 'SELECT DISTINCT specialty_name FROM genetic_testing_data WHERE 1=1';
  const params = [];
  if (continent) { sql += ' AND continent = ?';    params.push(continent); }
  if (country)   { sql += ' AND country_area IN (?)'; params.push([].concat(country)); }
  sql += ' ORDER BY specialty_name';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.specialty_name));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/genetic-testing/diseases ────────────────────────
router.get('/diseases', auth, async (req, res) => {
  const { continent, country, specialty } = req.query;
  let sql = 'SELECT DISTINCT disease_name FROM genetic_testing_data WHERE 1=1';
  const params = [];
  if (continent) { sql += ' AND continent = ?';      params.push(continent); }
  if (country)   { sql += ' AND country_area IN (?)';   params.push([].concat(country)); }
  if (specialty) { sql += ' AND specialty_name = ?'; params.push(specialty); }
  sql += ' ORDER BY disease_name';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.disease_name));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/genetic-testing/genders ─────────────────────────
router.get('/genders', auth, async (req, res) => {
  const { country, continent, disease } = req.query;
  let sql = 'SELECT DISTINCT gender_type FROM genetic_testing_data WHERE 1=1';
  const params = [];
  if (continent) { sql += ' AND continent = ?';    params.push(continent); }
  if (country)   { sql += ' AND country_area IN (?)'; params.push([].concat(country)); }
  if (disease)   { sql += ' AND disease_name = ?'; params.push(disease); }
  sql += ' ORDER BY gender_type';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.gender_type));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/genetic-testing ──────────────────────────────────
router.get('/', auth, async (req, res) => {
  const { continent, country, specialty, disease, gender, year_from, year_to } = req.query;

  let sql = 'SELECT * FROM genetic_testing_data WHERE 1=1';
  const params = [];

  if (continent) { sql += ' AND continent = ?';         params.push(continent); }
  if (country)   { sql += ' AND country_area IN (?)';      params.push([].concat(country)); }
  if (specialty) { sql += ' AND specialty_name = ?';    params.push(specialty); }
  if (disease)   { sql += ' AND disease_name = ?';      params.push(disease); }
  if (gender)    { sql += ' AND gender_type = ?';       params.push(gender); }
  if (year_from) { sql += ' AND CAST(published_period AS UNSIGNED) >= ?'; params.push(Number(year_from)); }
  if (year_to)   { sql += ' AND CAST(published_period AS UNSIGNED) <= ?'; params.push(Number(year_to)); }

  sql += ' ORDER BY published_period DESC, country_area ASC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
