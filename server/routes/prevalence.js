const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

// GET /api/prevalence  — filtered list
router.get('/', auth, async (req, res) => {
  const {
    specialty_id, disease_id, region_id, country_id,
    epi_metric, gender, year_from, year_to,
  } = req.query;

  let sql = `
    SELECT
      pi.id, d.name AS indication, d.abbreviation,
      ds.name AS specialty,
      c.name AS country, r.name AS region,
      pi.published_year, pi.study_period_start, pi.study_period_end,
      pi.gender, pi.age_group AS age, pi.ethnicity, pi.epi_metric,
      pi.estimate, pi.value_representation, pi.study_sample_type,
      pi.source_type, pi.reference
    FROM prevalence_incidence pi
    JOIN diseases d         ON pi.disease_id  = d.id
    JOIN disease_specialties ds ON d.specialty_id = ds.id
    JOIN countries c        ON pi.country_id  = c.id
    JOIN regions r          ON c.region_id    = r.id
    WHERE 1=1
  `;
  const params = [];

  if (specialty_id) { sql += ' AND ds.id = ?';             params.push(specialty_id); }
  if (disease_id)   { sql += ' AND d.id = ?';              params.push(disease_id); }
  if (region_id)    { sql += ' AND r.id = ?';              params.push(region_id); }
  if (country_id)   { sql += ' AND c.id = ?';              params.push(country_id); }
  if (epi_metric)   { sql += ' AND pi.epi_metric = ?';     params.push(epi_metric); }
  if (gender && gender !== 'All') { sql += ' AND pi.gender = ?'; params.push(gender); }
  if (year_from)    { sql += ' AND pi.published_year >= ?'; params.push(year_from); }
  if (year_to)      { sql += ' AND pi.published_year <= ?'; params.push(year_to); }

  sql += ' ORDER BY pi.published_year DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/prevalence/chart/by-country — for bar chart
router.get('/chart/by-country', auth, async (req, res) => {
  const { disease_id, epi_metric, gender } = req.query;
  let sql = `
    SELECT
      c.name AS country,
      pi.published_year,
      MAX(pi.estimate) AS estimate,
      pi.value_representation
    FROM prevalence_incidence pi
    JOIN countries c ON pi.country_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (disease_id) { sql += ' AND pi.disease_id = ?'; params.push(disease_id); }
  if (epi_metric) { sql += ' AND pi.epi_metric = ?'; params.push(epi_metric); }
  if (gender && gender !== 'All') { sql += ' AND pi.gender = ?'; params.push(gender); }
  sql += ' GROUP BY c.id, pi.published_year ORDER BY estimate DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/prevalence/specialties
router.get('/specialties', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM disease_specialties ORDER BY name');
  res.json(rows);
});

// GET /api/prevalence/diseases?specialty_id=1
router.get('/diseases', auth, async (req, res) => {
  const { specialty_id } = req.query;
  let sql = 'SELECT * FROM diseases';
  const params = [];
  if (specialty_id) { sql += ' WHERE specialty_id = ?'; params.push(specialty_id); }
  sql += ' ORDER BY name';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// GET /api/prevalence/regions
router.get('/regions', auth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM regions ORDER BY name');
  res.json(rows);
});

// GET /api/prevalence/countries?region_id=1
router.get('/countries', auth, async (req, res) => {
  const { region_id } = req.query;
  let sql = 'SELECT * FROM countries';
  const params = [];
  if (region_id) { sql += ' WHERE region_id = ?'; params.push(region_id); }
  sql += ' ORDER BY name';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

module.exports = router;
