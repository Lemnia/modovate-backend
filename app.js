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
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const tierRoutes = require('./routes/tierRoutes');

const app = express();

// ✅ Dozvoljeni domeni
const allowedOrigins = [
  'https://modovatestudio.com',
  'https://www.modovatestudio.com',
];

// ✅ CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  exposedHeaders: ['XSRF-TOKEN']
};

// ✅ Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// ✅ Middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(limiter);
app.use(xss());
app.use(mongoSanitize());

// ✅ Stripe webhook - mora biti PRE csrf
app.use('/api', webhookRoute);

// ✅ CSRF middleware
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// ✅ Dodavanje CSRF tokena kao kolačić
app.use((req, res, next) => {
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    secure: true,
    sameSite: 'None',
    path: '/',
  });
  next();
});

// ✅ API rute
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tiers', tierRoutes);
app.use('/api', stripeRoutes);

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

// ✅ Error handler za CSRF
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next(err);
});

module.exports = app;
