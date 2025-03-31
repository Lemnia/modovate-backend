const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  game: {
    type: String,
    required: true,
  },
  tier: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'canceled'],
    default: 'active',
  },
  startDate: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
