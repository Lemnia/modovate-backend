// app.js
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS (dozvoljavamo samo sa frontend domena)
const corsOptions = {
  origin: ['https://www.modovatestudio.com'],
  credentials: true,
};
app.use(cors(corsOptions));

// CSRF zaštita
const csrfProtection = csrf({ cookie: true });

// Rute
app.use('/api/auth', authRoutes);

// CSRF ruta
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ message: 'CSRF token set' });
});

module.exports = app;
