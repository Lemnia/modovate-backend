const express = require('express');
const router = express.Router();
const {
  createSubscription,
  cancelSubscription,
  getUserSubscriptions,
} = require('../controllers/subscriptionController');

const requireAuth = require('../middleware/authMiddleware');
router.use(requireAuth); // sve ispod mora imati validan token

router.post('/', createSubscription);
router.patch('/:id/cancel', cancelSubscription);
router.get('/user/me', (req, res, next) => {
  req.params.userId = req.user.id;
  next();
}, getUserSubscriptions);
router.get('/user/:userId', getUserSubscriptions);

module.exports = router;