const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Register route with validation & sanitization
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
      .escape()
  ],
  authController.register
);

// Login route with validation & sanitization
router.post(
  '/login',
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

// Logout
router.post('/logout', authController.logout);

module.exports = router;
