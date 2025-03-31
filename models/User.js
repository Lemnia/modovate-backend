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

  subscriptions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription', // moraš imati odgovarajući model za Subscription
    }
  ],
}, {
  timestamps: true, // automatski dodaje createdAt i updatedAt
});

module.exports = mongoose.model('User', userSchema);
