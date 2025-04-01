const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const app = express();

// CORS sa cookie podrškom
const corsOptions = {
  origin: 'https://modovatestudio.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 100
});

// Helmet sa CSP za slike sa drugih domena
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(limiter);
app.use(xss());
app.use(mongoSanitize());

// CSRF zaštita – samo za cookie-based autentifikaciju
app.use(csrf({ cookie: true }));

// Dodavanje CSRF tokena u response (za frontend)
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: false, secure: true, sameSite: 'Strict' });
  next();
});

// Rute
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/tiers', require('./routes/tierRoutes'));

// Root ruta za test
app.get('/', (req, res) => {
  res.send('Modovate Studio API is running...');
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running!' });
});

module.exports = app;
