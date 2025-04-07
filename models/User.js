// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  // ➔ Email potvrda
  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationToken: {
    type: String,
  },

  // ➔ Admin flag
  isAdmin: {
    type: Boolean,
    default: false,
  },

  // ➔ Pretplate korisnika
  subscriptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
