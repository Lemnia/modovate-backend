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

// ✅ CSRF protection
app.use(csrf({
  cookie: {
    httpOnly: false,
    sameSite: 'None',
    secure: true,
  }
}));

// ✅ Set CSRF cookie for frontend
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false,
    sameSite: 'None',
    secure: true,
  });
  next();
});

// ✅ API routes
app.use('/api/auth', require('./routes/authRoutes'));

// ✅ Test route
app.get('/', (req, res) => {
  res.send('Modovate Studio API is running...');
});

module.exports = app;
