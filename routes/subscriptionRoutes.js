const express = require('express');
const router = express.Router();
const {
  createSubscription,
  cancelSubscription,
  getUserSubscriptions,
} = require('../controllers/subscriptionController');

const requireAuth = require('../middleware/authMiddleware');
router.use(requireAuth); // sve ispod mora da ima token

router.post('/', createSubscription);
router.patch('/:id/cancel', cancelSubscription);
router.get('/user/:userId', getUserSubscriptions);

module.exports = router;
