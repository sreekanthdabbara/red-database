require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/epi',         require('./routes/epi'));
app.use('/api/population',  require('./routes/population'));
app.use('/api/survival',    require('./routes/survival'));
app.use('/api/definitions', require('./routes/definitions'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', version: '2.0' }));
app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 RED API running on http://localhost:${PORT}`));
