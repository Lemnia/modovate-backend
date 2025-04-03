const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

const router = express.Router();

// ✅ Register route with validation, sanitization and CSRF protection
router.post(
  '/register',
  csrfProtection,
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
      .escape()
  ],
  authController.register
);

// ✅ Login route with validation, sanitization and CSRF protection
router.post(
  '/login',
  csrfProtection,
  [
    body('email')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .escape()
  ],
  authController.login
);

// ✅ Logout with CSRF protection
router.post('/logout', csrfProtection, authController.logout);

// ✅ Auth status check via cookie
router.get('/status', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ isLoggedIn: false });
  res.json({ isLoggedIn: true });
});

// ✅ CSRF token for frontend (GET only)
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false,
    secure: true,
    sameSite: 'None'
  });
  res.status(200).json({ message: 'CSRF token set' });
});

module.exports = router;
