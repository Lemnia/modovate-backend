// stripeRoutes.js
const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');

router.use('/stripe', stripeController);

module.exports = router;
