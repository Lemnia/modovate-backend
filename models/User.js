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

  confirmed: {
    type: Boolean,
    default: false,
  },

  confirmationToken: {
    type: String,
  },

  isAdmin: {
    type: Boolean,
    default: false,
  },

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
