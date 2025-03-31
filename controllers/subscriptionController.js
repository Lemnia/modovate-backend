const Subscription = require('../models/Subscription');
const User = require('../models/User');

const createSubscription = async (req, res) => {
  try {
    const { userId, game, tier } = req.body;
    const sub = await Subscription.create({ user: userId, game, tier });
    await User.findByIdAndUpdate(userId, { $push: { subscriptions: sub._id } });
    res.status(201).json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Error creating subscription' });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(req.params.id, { status: 'canceled' }, { new: true });
    res.json(sub);
  } catch (err) {
    res.status(500).json({ message: 'Error canceling subscription' });
  }
};

const getUserSubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.params.userId, status: 'active' });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
};

module.exports = {
  createSubscription,
  cancelSubscription,
  getUserSubscriptions
};
