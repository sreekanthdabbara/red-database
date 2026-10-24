// Shared router for flat epi data tables loaded from the RD Excel templates
// (mortality_data, incidence_data). `typeColumn` is the table's metric/type column.
const express = require('express');
const db      = require('../config/db');
const auth    = require('../middleware/auth');

module.exports = function epiTableRouter(table, typeColumn) {
  const router = express.Router();

  // query param → column
  const FILTERS = {
    continent: 'continent',
    country:   'country_area',
    specialty: 'specialty_name',
    disease:   'disease_name',
    gender:    'gender_type',
    type:      typeColumn,
  };

  // A param repeated in the query string (?country=A&country=B) arrives as an array
  const buildWhere = (query, keys) => {
    let sql = ' WHERE 1=1';
    const params = [];
    keys.forEach(k => {
      if (query[k]) { sql += ` AND ${FILTERS[k]} IN (?)`; params.push([].concat(query[k])); }
    });
    return { sql, params };
  };

  const distinct = (column, keys) => async (req, res) => {
    const { sql, params } = buildWhere(req.query, keys);
    try {
      const [rows] = await db.query(
        `SELECT DISTINCT ${column} FROM ${table}${sql} AND ${column} IS NOT NULL ORDER BY ${column}`,
        params
      );
      res.json(rows.map(r => r[column]));
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  // ── Cascading filter options ─────────────────────────────────
  router.get('/continents',  auth, distinct('continent',      []));
  router.get('/countries',   auth, distinct('country_area',   ['continent']));
  router.get('/specialties', auth, distinct('specialty_name', ['continent', 'country']));
  router.get('/diseases',    auth, distinct('disease_name',   ['continent', 'country', 'specialty']));
  router.get('/genders',     auth, distinct('gender_type',    ['continent', 'country', 'disease']));
  router.get('/types',       auth, distinct(typeColumn,       ['continent', 'country', 'disease', 'gender']));

  // ── GET / ─────────────────────────────────────────────────────
  router.get('/', auth, async (req, res) => {
    const { year_from, year_to } = req.query;
    let { sql, params } = buildWhere(req.query, Object.keys(FILTERS));

    if (year_from) { sql += ' AND CAST(published_period AS UNSIGNED) >= ?'; params.push(Number(year_from)); }
    if (year_to)   { sql += ' AND CAST(published_period AS UNSIGNED) <= ?'; params.push(Number(year_to)); }

    try {
      const [rows] = await db.query(
        `SELECT * FROM ${table}${sql} ORDER BY published_period DESC, country_area ASC`,
        params
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};
