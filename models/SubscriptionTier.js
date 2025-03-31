const mongoose = require('mongoose');

const subscriptionTierSchema = new mongoose.Schema({
  game: {
    type: String,
    required: true,
    unique: true,
  },
  tiers: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      features: [String],
    },
  ],
});

module.exports = mongoose.model('SubscriptionTier', subscriptionTierSchema);
