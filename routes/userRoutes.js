// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const requireAuth = require('../middleware/authMiddleware');
const User = require('../models/User');

// Folder for avatars
const avatarFolder = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarFolder)) fs.mkdirSync(avatarFolder, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarFolder),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}${ext}`);
  },
});
const upload = multer({ storage });

// Protect all routes below
router.use(requireAuth);

// POST avatar upload
router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatar = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.status(200).json({ avatarUrl: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// GET current avatar
router.get('/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.avatar) return res.json({ avatarUrl: null });
    res.json({ avatarUrl: user.avatar });
  } catch (err) {
    res.status(500).json({ message: 'Fetch failed', error: err.message });
  }
});

module.exports = router;
