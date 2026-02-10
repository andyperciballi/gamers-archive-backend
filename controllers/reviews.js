const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/review');
const verifyToken = require('../middleware/verify-token');

router.use(verifyToken);

// GET /reviews/games/:gameId - Get all reviews for a game
router.get('/games/:gameId', async (req, res) => {
  try {
    const reviews = await Review.find({ gameId: req.params.gameId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});


// POST /reviews/games/:gameId - Create a review for a game
router.post('/games/:gameId', async (req, res) => {
  try {
    // Prevent duplicate reviews from the same user on the same game
    const existingReview = await Review.findOne({
      gameId: req.params.gameId,
      author: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this game.' });
    }

    const review = await Review.create({
      ...req.body,
      gameId: req.params.gameId,
      author: req.user._id,
    });

    const populated = await review.populate('author', 'username');

    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create review.' });
  }
});

// PUT /reviews/:reviewId - Update a review
router.put('/:reviewId', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    // Only the author can update their review
    if (!review.author.equals(req.user._id)) {
      return res.status(403).json({ error: 'You are not authorized to edit this review.' });
    }

    // Only allow updating specific fields
    const allowedUpdates = ['text', 'rating'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });

    await review.save();
    const populated = await review.populate('author', 'username');

    res.status(200).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update review.' });
  }
});

// DELETE /reviews/:reviewId - Delete a review
router.delete('/:reviewId', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    // Only the author can delete their review
    if (!review.author.equals(req.user._id)) {
      return res.status(403).json({ error: 'You are not authorized to delete this review.' });
    }

    await review.deleteOne();

    res.status(200).json({ message: 'Review deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete review.' });
  }
});

module.exports = router;