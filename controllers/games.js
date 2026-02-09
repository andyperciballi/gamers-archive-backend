// controllers/games.js
const router = require('express').Router();
const { igdbRequest } = require('../utils/igdb');
const Game = require('../models/game');

// Search IGDB
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const games = await igdbRequest(
      'games',
      `search "${query}"; fields name, cover.url, summary, genres.name, platforms.name; limit 10;`
    );
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// Save a game to user's archive
router.post('/', async (req, res) => {
  try {
    req.body.owner = req.user._id;
    const game = await Game.create(req.body);
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// Get user's saved games
router.get('/', async (req, res) => {
  try {
    const games = await Game.find({ owner: req.user._id });
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// Delete a saved game
router.delete('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ err: 'Game not found' });
    if (!game.owner.equals(req.user._id)) return res.status(403).json({ err: 'Not authorized' });
    await game.deleteOne();
    res.status(200).json({ message: 'Game removed' });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

module.exports = router;