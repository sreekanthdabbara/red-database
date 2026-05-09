// routes/mortality.js
const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const { disease_id, country_id, gender } = req.query;
  let sql = `
    SELECT m.*, d.name AS indication, c.name AS country, r.name AS region
    FROM mortality m
    JOIN diseases d  ON m.disease_id  = d.id
    JOIN countries c ON m.country_id  = c.id
    JOIN regions r   ON c.region_id   = r.id
    WHERE 1=1
  `;
  const params = [];
  if (disease_id) { sql += ' AND m.disease_id = ?';  params.push(disease_id); }
  if (country_id) { sql += ' AND m.country_id = ?';  params.push(country_id); }
  if (gender && gender !== 'All') { sql += ' AND m.gender = ?'; params.push(gender); }
  sql += ' ORDER BY m.published_year DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
