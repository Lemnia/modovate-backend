// app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const app = express();

const allowedOrigins = [
  'https://modovatestudio.com',
  'https://www.modovatestudio.com',
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
  credentials: true,
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(xss());
app.use(mongoSanitize());
app.use(limiter);

// CSRF protection middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: false,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
  }
});
app.use(csrfProtection);

// Set CSRF cookie for the frontend
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false,
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production',
    // Uncomment the following if you need to force the cookie domain to your frontend:
    // domain: 'modovatestudio.com',
  });
  next();
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes')); // if applicable

// Test route
app.get('/', (req, res) => {
  res.send('Modovate Studio API is running...');
});

module.exports = app;
