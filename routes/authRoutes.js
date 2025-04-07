// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const csrf = require('csurf');

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

// ➔ Provera autentifikacije
router.get('/status', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ isLoggedIn: false });
  res.json({ isLoggedIn: true });
});

// ➔ CSRF token ruta
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ message: 'CSRF token set' });
});

// ➔ Registracija
router.post(
  '/register',
  [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .escape(),
    body('email')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .escape(),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords do not match')
  ],
  authController.register
);

// ➔ Potvrda emaila
router.get('/verify-email/:token', authController.verifyEmail);

// ➔ Login
router.post(
  '/login',
  [
    body('email')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .escape(),
  ],
  authController.login
);

// ➔ Logout
router.post('/logout', authController.logout);

// ➔ Forgot Password
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
  ],
  authController.forgotPassword
);

// ➔ Reset Password
router.post(
  '/reset-password/:token',
  [
    body('newPassword')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
      .escape(),
  ],
  authController.resetPassword
);

module.exports = router;
