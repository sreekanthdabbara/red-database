const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

// ── GET /api/survival/filter-options ─────────────────────────
router.get('/filter-options', auth, async (req, res) => {
  try {
    const [[continents]] = await Promise.all([
      db.query('SELECT DISTINCT continent FROM survival_data WHERE continent IS NOT NULL ORDER BY continent'),
    ]);
    res.json({
      continents: continents.map(r => r.continent),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/survival/countries?continent=X ───────────────────
router.get('/countries', auth, async (req, res) => {
  const { continent } = req.query;
  let sql = 'SELECT DISTINCT country_area FROM survival_data WHERE 1=1';
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

// ── GET /api/survival/specialties?country=X ───────────────────
router.get('/specialties', auth, async (req, res) => {
  const { country, continent } = req.query;
  let sql = 'SELECT DISTINCT specialty_name FROM survival_data WHERE 1=1';
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

// ── GET /api/survival/diseases?country=X&specialty=Y ─────────
router.get('/diseases', auth, async (req, res) => {
  const { continent, country, specialty } = req.query;
  let sql = 'SELECT DISTINCT disease_name FROM survival_data WHERE 1=1';
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

// ── GET /api/survival/genders ─────────────────────────────────
router.get('/genders', auth, async (req, res) => {
  const { country, continent, disease } = req.query;
  let sql = 'SELECT DISTINCT gender_type FROM survival_data WHERE 1=1';
  const params = [];
  if (continent) { sql += ' AND continent = ?';     params.push(continent); }
  if (country)   { sql += ' AND country_area IN (?)';  params.push([].concat(country)); }
  if (disease)   { sql += ' AND disease_name = ?';  params.push(disease); }
  sql += ' ORDER BY gender_type';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.gender_type));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/survival/survival-types ─────────────────────────
router.get('/survival-types', auth, async (req, res) => {
  const { country, continent, disease, gender } = req.query;
  let sql = 'SELECT DISTINCT survival_type FROM survival_data WHERE 1=1';
  const params = [];
  if (continent) { sql += ' AND continent = ?';     params.push(continent); }
  if (country)   { sql += ' AND country_area IN (?)';  params.push([].concat(country)); }
  if (disease)   { sql += ' AND disease_name = ?';  params.push(disease); }
  if (gender)    { sql += ' AND gender_type = ?';   params.push(gender); }
  sql += ' ORDER BY survival_type';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.survival_type));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/survival/year-types ─────────────────────────────
router.get('/year-types', auth, async (req, res) => {
  const { country, continent, disease, gender, survival_type } = req.query;
  let sql = 'SELECT DISTINCT year_of_survival FROM survival_data WHERE 1=1';
  const params = [];
  if (continent)     { sql += ' AND continent = ?';      params.push(continent); }
  if (country)       { sql += ' AND country_area IN (?)';   params.push([].concat(country)); }
  if (disease)       { sql += ' AND disease_name = ?';   params.push(disease); }
  if (gender)        { sql += ' AND gender_type = ?';    params.push(gender); }
  if (survival_type) { sql += ' AND survival_type = ?';  params.push(survival_type); }
  sql += ' ORDER BY year_of_survival';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.year_of_survival));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/survival ─────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  const { continent, country, specialty, disease, gender, survival_type, year_of_survival, year_from, year_to } = req.query;

  let sql = 'SELECT * FROM survival_data WHERE 1=1';
  const params = [];

  if (continent)        { sql += ' AND continent = ?';         params.push(continent); }
  if (country)          { sql += ' AND country_area IN (?)';      params.push([].concat(country)); }
  if (specialty)        { sql += ' AND specialty_name = ?';    params.push(specialty); }
  if (disease)          { sql += ' AND disease_name = ?';      params.push(disease); }
  if (gender)           { sql += ' AND gender_type = ?';       params.push(gender); }
  if (survival_type)    { sql += ' AND survival_type = ?';     params.push(survival_type); }
  if (year_of_survival) { sql += ' AND year_of_survival = ?';  params.push(year_of_survival); }
  if (year_from)        { sql += ' AND CAST(published_period AS UNSIGNED) >= ?'; params.push(Number(year_from)); }
  if (year_to)          { sql += ' AND CAST(published_period AS UNSIGNED) <= ?'; params.push(Number(year_to)); }

  sql += ' ORDER BY published_period DESC, country_area ASC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;