const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');

const requireAuth = require('../middleware/authMiddleware');
router.use(requireAuth); // štiti celu rutu — vidiš samo ako si prijavljen

router.get('/', getAllUsers);

module.exports = router;
