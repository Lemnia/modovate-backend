const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const stripeRoutes = require('./routes/stripeRoutes');
const webhookRoute = require('./routes/stripeWebhook');

const app = express();

// ✅ CORS sa podrškom za više domena
const allowedOrigins = [
  'https://modovatestudio.com',
  'https://www.modovatestudio.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 100
});

// ✅ Security middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(limiter);
app.use(xss());
app.use(mongoSanitize());

// ✅ CSRF zaštita za cookie-based auth
app.use(csrf({ cookie: true }));

// ✅ Dodaj CSRF token kao kolačić za frontend
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: false, secure: true, sameSite: 'Strict' });
  next();
});

// ✅ API rute
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/tiers', require('./routes/tierRoutes'));
app.use('/api', stripeRoutes);
app.use('/api', webhookRoute);

// ✅ Statika
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running!' });
});

// ✅ Root test ruta
app.get('/', (req, res) => {
  res.send('Modovate Studio API is running...');
});

module.exports = app;
