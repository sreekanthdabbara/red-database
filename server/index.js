const path = require('path');
const fs   = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors    = require('cors');

// Refuse to run in production with a missing or publicly known JWT secret
const JWT_PLACEHOLDER = 'replace_with_a_long_random_secret_key';
const jwtSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' &&
    (!jwtSecret || jwtSecret === JWT_PLACEHOLDER || jwtSecret.length < 32)) {
  const reason = !jwtSecret ? 'is not set'
    : jwtSecret === JWT_PLACEHOLDER ? 'is still the placeholder'
    : `is only ${jwtSecret.length} characters`;
  // Names only (never values), to spot typos like "JWT_SECRET " or "jwt_secret"
  const lookalikes = Object.keys(process.env).filter(k => /jwt|secret/i.test(k));
  console.error(`❌ JWT_SECRET ${reason} — it must be a random string of at least 32 characters in production`);
  console.error(`   Variables with JWT/SECRET in the name: ${lookalikes.map(k => JSON.stringify(k)).join(', ') || 'none'}`);
  process.exit(1);
}

const app = express();

// Same-origin in production (site and API served together); CLIENT_URL allows a separate front end
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/auth',            require('./routes/auth'));
app.use('/api/epi',             require('./routes/epi'));
app.use('/api/population',      require('./routes/population'));
app.use('/api/survival',        require('./routes/survival'));
app.use('/api/mortality',       require('./routes/mortality'));
app.use('/api/incidence',       require('./routes/incidence'));
app.use('/api/mutation-rate',   require('./routes/mutationRate'));
app.use('/api/genetic-testing', require('./routes/geneticTesting'));
app.use('/api/definitions',     require('./routes/definitions'));

// Includes database reachability (host/port/db name only, never credentials)
const db = require('./config/db');
app.get('/api/health', async (_, res) => {
  let database;
  try {
    await db.query('SELECT 1');
    database = { ok: true, target: db.target };
  } catch (err) {
    // Which DB variables reached the app — names and set/empty only, never values
    const received = Object.keys(process.env)
      .filter(k => /^(MYSQL|DB_)/i.test(k))
      .map(k => `${JSON.stringify(k)}: ${process.env[k] ? 'set' : 'EMPTY'}`);
    database = { ok: false, target: db.target, error: db.describeError(err), variables: received.length ? received : 'none' };
  }
  res.json({ status: 'ok', version: '2.0', database });
});
app.use('/api', (_, res) => res.status(404).json({ message: 'Route not found' }));

// ── Serve the built React site (npm run build at the repo root) ──
const CLIENT_BUILD = path.join(__dirname, '../client/build');
if (fs.existsSync(CLIENT_BUILD)) {
  app.use(express.static(CLIENT_BUILD));
  // Client-side routes (/mortality, /login, …) all load index.html
  app.get('*', (_, res) => res.sendFile(path.join(CLIENT_BUILD, 'index.html')));
}

app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 RED API running on http://localhost:${PORT}`));
