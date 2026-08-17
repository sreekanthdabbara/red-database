require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/epi',         require('./routes/epi'));
app.use('/api/population',  require('./routes/population'));
app.use('/api/definitions', require('./routes/definitions'));

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', version: '2.0' }));

// 404 catch-all
app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 RED API running on http://localhost:${PORT}`));
