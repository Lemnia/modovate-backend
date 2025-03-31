const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate('subscriptions');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllUsers };
