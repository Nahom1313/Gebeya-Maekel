const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/', protect, adminOnly, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    res.json({ imageUrl: req.file.path });
  } catch (error) {
    console.error('Upload error:', error); // 👈 this will show in terminal
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;