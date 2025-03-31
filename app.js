const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/tiers', require('./routes/tierRoutes'));

app.get('/', (req, res) => {
  res.send('Modovate Studio API is running...');
});

module.exports = app;
