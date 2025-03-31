const express = require('express');
const router = express.Router();
const { getAllTiers, createOrUpdateTiers } = require('../controllers/tierController');

const requireAuth = require('../middleware/authMiddleware');

// GET je otvoren za sve korisnike
router.get('/', getAllTiers);

// POST (kreira ili menja tier) samo ako si prijavljen
router.post('/', requireAuth, createOrUpdateTiers);

module.exports = router;
