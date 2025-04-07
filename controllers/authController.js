// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

// Create JWT token
const createToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Setup OAuth2 client for Outlook
const { OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET, OUTLOOK_TENANT_ID, OUTLOOK_CLIENT_SECRET_VALUE, OUTLOOK_EMAIL } = process.env;

const outlookOAuth2Config = {
  clientId: OUTLOOK_CLIENT_ID,
  clientSecret: OUTLOOK_CLIENT_SECRET_VALUE, // Ovo je client secret koji si sad generisala
  tenantId: OUTLOOK_TENANT_ID,
  authorityHostUrl: 'https://login.microsoftonline.com',
  scopes: ['https://graph.microsoft.com/.default'],
};

// Function to get access token
const getOutlookAccessToken = async () => {
  const url = `https://login.microsoftonline.com/${outlookOAuth2Config.tenantId}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append('client_id', outlookOAuth2Config.clientId);
  params.append('scope', 'https://graph.microsoft.com/.default');
  params.append('client_secret', outlookOAuth2Config.clientSecret);
  params.append('grant_type', 'client_credentials');

  const response = await fetch(url, {
    method: 'POST',
    body: params,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get access token: ${data.error_description}`);
  }
  return data.access_token;
};

// Send welcome email
const sendWelcomeEmail = async (toEmail, username) => {
  const accessToken = await getOutlookAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
      type: 'OAuth2',
      user: OUTLOOK_EMAIL,
      accessToken,
      clientId: outlookOAuth2Config.clientId,
      clientSecret: outlookOAuth2Config.clientSecret,
      tenantId: outlookOAuth2Config.tenantId,
    },
  });

  await transporter.sendMail({
    from: `"Modovate Studio" <${OUTLOOK_EMAIL}>`,
    to: toEmail,
    subject: 'Welcome to Modovate Studio!',
    text: `Hello ${username},\n\nWelcome to Modovate Studio! We're thrilled to have you.\n\nEnjoy!\nThe Modovate Team`,
    html: `<h1>Hello ${username},</h1><p>Welcome to <strong>Modovate Studio</strong>! We're thrilled to have you.<br><br>Enjoy!<br><strong>The Modovate Team</strong></p>`,
  });
};

// REGISTER
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
      } else {
        return res.status(400).json({ message: 'User already exists' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = createToken(newUser);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 📩 Šaljemo dobrodošlicu
    await sendWelcomeEmail(email, username);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

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

// LOGOUT
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};
