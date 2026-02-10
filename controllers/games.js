// controllers/games.js
const router = require('express').Router();
const { igdbRequest } = require('../utils/igdb');
const ApiGame = require('../models/IgdbGame');
const LibraryItem = require('../models/LibraryItem');

// Search IGDB
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const games = await igdbRequest(
      'games',
      `search "${query}";
       fields name, cover.url, summary, genres.name, platforms.name;
       limit 10;`
    );
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// Add a game to user's library
router.post('/', async (req, res) => {
  try {
    const {
      igdbGameId,
      title,
      coverUrl,
      summary,
      platform,
      genre,
      status,
      notes,
    } = req.body;

    // 1. Find or create ApiGame
    let apiGame = await ApiGame.findOne({ igdbGameId });

    if (!apiGame) {
      apiGame = await ApiGame.create({
        igdbGameId,
        title,
        coverUrl,
        summary,
        platform,
        genre,
      });
    }

    // 2. Create LibraryItem
    const libraryItem = await LibraryItem.create({
      userId: req.user._id,
      gameId: apiGame._id,
      status,
      notes,
    });

    // 3. Populate and return
    const populatedItem = await libraryItem.populate('gameId');

    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// Get user's library
router.get('/', async (req, res) => {
  try {
    const library = await LibraryItem.find({ userId: req.user._id })
      .populate('gameId');
    res.status(200).json(library);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

// Remove game from library
router.delete('/:id', async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ err: 'Library item not found' });
    }

    if (!item.userId.equals(req.user._id)) {
      return res.status(403).json({ err: 'Not authorized' });
    }

    await item.deleteOne();
    res.status(200).json({ message: 'Game removed from library' });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

module.exports = router;
