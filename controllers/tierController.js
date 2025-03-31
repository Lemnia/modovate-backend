const Tier = require('../models/SubscriptionTier');

const getAllTiers = async (req, res) => {
  try {
    const tiers = await Tier.find();
    res.json(tiers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tiers' });
  }
};

const createOrUpdateTiers = async (req, res) => {
  try {
    const { game, tiers } = req.body;
    const updated = await Tier.findOneAndUpdate(
      { game },
      { tiers },
      { upsert: true, new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating tiers' });
  }
};

module.exports = { getAllTiers, createOrUpdateTiers };
