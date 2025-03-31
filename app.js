const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rute
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/tiers', require('./routes/tierRoutes'));

// Root ruta za test
app.get('/', (req, res) => {
  res.send('Modovate Studio API is running...');
});

// Health check ruta za proveru statusa servera
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running!' });
});

module.exports = app;
