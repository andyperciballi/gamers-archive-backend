const router = require('express').Router();
const User = require('../models/user');
const verifyToken = require('../middleware/verify-token');

// Index (all users) - authenticated
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// Get another user's username for library - authenticated
router.get('/:userId/public', verifyToken, async (req, res) => {
  try {
    const otherUser = await User.findById(req.params.userId).select('username');
    if (!otherUser) return res.status(404).json({ err: 'User not found' });
    res.status(200).json(otherUser);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});


// Get authenticated user's profile
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    if (req.user._id !== req.params.userId) {
      res.status(403);
      throw new Error('Not Authorized');
    }
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ err: 'User not found' });
    res.status(200).json({ user });
  } catch (error) {
    if (req.statusCode === 403 || req.statusCode === 404) {
      res.json({ err: error.message });
    } else {
      res.status(500).json({ err: error.message });
    }
  }
});

module.exports = router;
