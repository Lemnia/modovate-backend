const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const crypto = require('crypto');
const { sendCustomEmail } = require('../utils/emailService');

// ➔ Kreiranje JWT tokena
const createToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// ========== REGISTRACIJA ==========
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already in use' });
      } else if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already in use' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    });

    await newUser.save();

    await sendCustomEmail({
      recipientEmail: email,
      subject: 'Confirm Your Modovate Studio Account',
      title: 'Welcome to Modovate Studio!',
      greeting: `Hi <strong>${username}</strong>,`,
      bodyText: `We are thrilled to welcome you to <strong>Modovate Studio</strong> — the home of creativity, innovation, and endless possibilities. Please confirm your email address to activate your account and start exploring everything we have prepared for you.`,
      buttonText: 'Verify My Email',
      buttonLink: `${process.env.BASE_URL}/verify-email/${verificationToken}`,
      footerNote: `© 2025 Modovate Studio. All rights reserved.<br>You are receiving this email because you created an account on <strong>Modovate Studio</strong>.`
    });

    res.status(201).json({ message: 'Registration successful. Please check your email to confirm your account.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// ========== LOGIN ==========
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please confirm your email address before logging in.' });
    }

    const token = createToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// ========== LOGOUT ==========
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

// ========== VERIFY EMAIL ==========
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email confirmed successfully. You can now log in.' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification.' });
  }
};

// ========== FORGOT PASSWORD ==========
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No account with that email found.' });
    }

    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendCustomEmail({
      recipientEmail: user.email,
      subject: 'Reset Your Modovate Studio Password',
      title: 'Reset Your Password',
      greeting: `Hi <strong>${user.username}</strong>,`,
      bodyText: `We received a request to reset your password. Click the button below to set up a new password. If you did not request a password reset, you can safely ignore this email.`,
      buttonText: 'Reset Password',
      buttonLink: `${process.env.BASE_URL}/reset-password/${resetPasswordToken}`,
      footerNote: `© 2025 Modovate Studio. All rights reserved.<br>If you did not request this password reset, no further action is required.`
    });

    res.status(200).json({ message: 'Password reset email sent. Please check your inbox.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during forgot password.' });
  }
};

// ========== RESET PASSWORD ==========
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset.' });
  }
};
