const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

// ── GET /api/population/filter-options ───────────────────────
router.get('/filter-options', auth, async (req, res) => {
  try {
    const [[regions], [genders]] = await Promise.all([
      db.query('SELECT DISTINCT region FROM population_gender ORDER BY region'),
      db.query('SELECT DISTINCT gender FROM population_gender ORDER BY gender'),
    ]);
    res.json({
      regions: regions.map(r => r.region),
      genders: genders.map(r => r.gender),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/population/countries?region=Asia ─────────────────
router.get('/countries', auth, async (req, res) => {
  const { region } = req.query;
  let sql = 'SELECT DISTINCT country FROM population_gender WHERE 1=1';
  const params = [];
  if (region) { sql += ' AND region = ?'; params.push(region); }
  sql += ' ORDER BY country';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.country));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/population/gender ────────────────────────────────
router.get('/gender', auth, async (req, res) => {
  const { country, region, gender, year_from, year_to } = req.query;
  let sql = 'SELECT * FROM population_gender WHERE 1=1';
  const params = [];
  if (country)   { sql += ' AND country = ?';                  params.push(country); }
  if (region)    { sql += ' AND region = ?';                   params.push(region); }
  if (gender && gender !== 'All') { sql += ' AND gender = ?';  params.push(gender); }
  if (year_from) { sql += ' AND year >= ?';                    params.push(+year_from); }
  if (year_to)   { sql += ' AND year <= ?';                    params.push(+year_to); }
  sql += ' ORDER BY year ASC, country ASC LIMIT 2000';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/population/growth ────────────────────────────────
router.get('/growth', auth, async (req, res) => {
  const { country, region, gender, year_from, year_to } = req.query;
  let sql = 'SELECT * FROM population_growth WHERE 1=1';
  const params = [];
  if (country)   { sql += ' AND country = ?';                  params.push(country); }
  if (region)    { sql += ' AND region = ?';                   params.push(region); }
  if (gender && gender !== 'All') { sql += ' AND gender = ?';  params.push(gender); }
  if (year_from) { sql += ' AND year >= ?';                    params.push(+year_from); }
  if (year_to)   { sql += ' AND year <= ?';                    params.push(+year_to); }
  sql += ' ORDER BY year ASC LIMIT 2000';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/population/age ───────────────────────────────────
router.get('/age', auth, async (req, res) => {
  const { country, region, year, year_from, year_to, gender } = req.query;
  let sql = 'SELECT * FROM population_age WHERE 1=1';
  const params = [];
  if (country)   { sql += ' AND country = ?';                  params.push(country); }
  if (region)    { sql += ' AND region = ?';                   params.push(region); }
  if (year)      { sql += ' AND year = ?';                     params.push(+year); }
  if (year_from) { sql += ' AND year >= ?';                    params.push(+year_from); }
  if (year_to)   { sql += ' AND year <= ?';                    params.push(+year_to); }
  if (gender && gender !== 'All') { sql += ' AND gender = ?';  params.push(gender); }
  sql += ' ORDER BY country ASC, year ASC LIMIT 5000';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;