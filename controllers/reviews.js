const router = require('express').Router();
const Review = require('../models/Review');
const ApiGame = require('../models/IgdbGame');
const verifyToken = require('../middleware/verify-token');

router.get('/game/:igdbGameId', verifyToken, async (req, res) => {
  try {
    const apiGame = await ApiGame.findOne({ igdbGameId: Number(req.params.igdbGameId) });
    if (!apiGame) return res.status(200).json([]);

    const reviews = await Review.find({ gameId: apiGame._id })
      .populate('author', 'username');
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

router.post('/game/:igdbGameId', verifyToken, async (req, res) => {
  try {
    const apiGame = await ApiGame.findOne({ igdbGameId: Number(req.params.igdbGameId) });
    if (!apiGame) return res.status(404).json({ err: 'Game not found. Add it to a library first.' });

    const review = await Review.create({
      author: req.user._id,
      gameId: apiGame._id,
      rating: req.body.rating,
      Text: req.body.Text,
    });

    const populated = await review.populate('author', 'username');
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ err: 'You already reviewed this game.' });
    }
    res.status(500).json({ err: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ err: 'Review not found' });
    if (!review.author.equals(req.user._id)) return res.status(403).json({ err: 'Not authorized' });

    review.rating = req.body.rating ?? review.rating;
    review.Text = req.body.Text ?? review.Text;
    await review.save();

    const populated = await review.populate('author', 'username');
    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ err: 'Review not found' });
    if (!review.author.equals(req.user._id)) return res.status(403).json({ err: 'Not authorized' });

    await review.deleteOne();
    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

module.exports = router;