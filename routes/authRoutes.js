const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const csrf = require('csurf');

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

// ========== CHECK AUTHENTICATION STATUS ==========
router.get('/status', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ isLoggedIn: false });
  res.json({ isLoggedIn: true });
});

// ========== CSRF TOKEN SET ==========
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
  });
  res.status(200).json({ message: 'CSRF token set' });
});

// ========== REGISTER ==========
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

// ========== VERIFY EMAIL ==========
router.get('/verify-email/:token', authController.verifyEmail);

// ========== LOGIN ==========
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

// ========== LOGOUT ==========
router.post('/logout', authController.logout);

// ========== FORGOT PASSWORD ==========
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
  ],
  authController.forgotPassword
);

// ========== RESET PASSWORD ==========
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
