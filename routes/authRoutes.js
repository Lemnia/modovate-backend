const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const csrf = require('csurf');

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

// ✅ Auth status check via cookie
router.get('/status', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ isLoggedIn: false });
  res.json({ isLoggedIn: true });
});

// ✅ CSRF token za frontend
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false,
    secure: true,
    sameSite: 'None',
  });
  res.status(200).json({ message: 'CSRF token set' });
});

// ✅ Register route
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
  ],
  authController.register
);

// ✅ Login route
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

// ✅ Logout route
router.post('/logout', authController.logout);

module.exports = router;
