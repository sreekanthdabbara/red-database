const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

// ── GET /api/survival/filter-options ─────────────────────────
router.get('/filter-options', auth, async (req, res) => {
  try {
    const [[continents], [specialties], [survivalTypes], [yearTypes]] = await Promise.all([
      db.query('SELECT DISTINCT continent FROM survival_data WHERE continent IS NOT NULL ORDER BY continent'),
      db.query('SELECT DISTINCT specialty_name FROM survival_data WHERE specialty_name IS NOT NULL ORDER BY specialty_name'),
      db.query('SELECT DISTINCT survival_type FROM survival_data WHERE survival_type IS NOT NULL ORDER BY survival_type'),
      db.query('SELECT DISTINCT year_of_survival FROM survival_data WHERE year_of_survival IS NOT NULL ORDER BY year_of_survival'),
    ]);
    res.json({
      continents:    continents.map(r => r.continent),
      specialties:   specialties.map(r => r.specialty_name),
      survivalTypes: survivalTypes.map(r => r.survival_type),
      yearTypes:     yearTypes.map(r => r.year_of_survival),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/survival/countries ───────────────────────────────
router.get('/countries', auth, async (req, res) => {
  const { continent, disease } = req.query;
  let sql = 'SELECT DISTINCT country_area FROM survival_data WHERE 1=1';
  const params = [];
  if (continent) { sql += ' AND continent = ?';    params.push(continent); }
  if (disease)   { sql += ' AND disease_name = ?'; params.push(disease); }
  sql += ' ORDER BY country_area';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.country_area));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/survival/diseases ────────────────────────────────
router.get('/diseases', auth, async (req, res) => {
  const { continent, specialty } = req.query;
  let sql = 'SELECT DISTINCT disease_name FROM survival_data WHERE 1=1';
  const params = [];
  if (continent) { sql += ' AND continent = ?';     params.push(continent); }
  if (specialty) { sql += ' AND specialty_name = ?'; params.push(specialty); }
  sql += ' ORDER BY disease_name';
  try {
    const [rows] = await db.query(sql, params);
    res.json(rows.map(r => r.disease_name));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/survival ─────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  const { continent, country, specialty, disease, gender, survival_type, year_of_survival, year_from, year_to } = req.query;

  let sql = 'SELECT * FROM survival_data WHERE 1=1';
  const params = [];

  if (continent)      { sql += ' AND continent = ?';       params.push(continent); }
  if (country)        { sql += ' AND country_area = ?';    params.push(country); }
  if (specialty)      { sql += ' AND specialty_name = ?';  params.push(specialty); }
  if (disease)        { sql += ' AND disease_name = ?';    params.push(disease); }
  if (gender)         { sql += ' AND gender_type = ?';     params.push(gender); }
  if (survival_type)  { sql += ' AND survival_type = ?';   params.push(survival_type); }
  if (year_of_survival) { sql += ' AND year_of_survival = ?'; params.push(year_of_survival); }
  if (year_from)      { sql += ' AND CAST(published_period AS UNSIGNED) >= ?'; params.push(Number(year_from)); }
  if (year_to)        { sql += ' AND CAST(published_period AS UNSIGNED) <= ?'; params.push(Number(year_to)); }

  sql += ' ORDER BY published_period DESC, country_area ASC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
