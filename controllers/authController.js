const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

// Mail transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(20).toString('hex');

    // Create user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      confirmationToken,
    });

    await newUser.save();

    // Send confirmation email
    const mailOptions = {
      from: `"Modovate Studio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirm your email',
      html: `
        <div style="font-family: Arial, sans-serif; background: #0f0f0f; padding: 40px; color: white; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="${baseUrl}/assets/logo/Logotip_transparent_notext.png" alt="Logo" width="80" />
          </div>
          <h2 style="color: #00B8B8;">Confirm Your Email Address</h2>
          <p style="font-size: 16px;">Hi ${username},</p>
          <p style="font-size: 16px;">Thank you for registering at Modovate Studio. Please click the button below to confirm your email address and activate your account:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${baseUrl}/api/auth/confirm/${confirmationToken}" style="padding: 12px 24px; background: #F47800; color: white; text-decoration: none; font-weight: bold; border-radius: 5px;">Confirm Email</a>
          </div>
          <p style="font-size: 14px;">If you did not create an account, you can ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'User registered. Please check your email to confirm your account.' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Confirm email
exports.confirmEmail = async (req, res) => {
  try {
    const user = await User.findOne({ confirmationToken: req.params.token });
    if (!user) return res.status(400).send('Invalid confirmation token');

    user.confirmed = true;
    user.confirmationToken = undefined;
    await user.save();

    res.redirect(`${baseUrl}/confirmed`);
  } catch (error) {
    console.error('Error confirming email:', error);
    res.status(500).send('Server error');
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Check if confirmed
    if (!user.confirmed) {
      return res.status(403).json({ message: 'Please confirm your email before logging in.' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
