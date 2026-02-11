const router = require('express').Router();
const { igdbRequest } = require('../utils/igdb');
const ApiGame = require('../models/IgdbGame');
const LibraryItem = require('../models/LibraryItem');
const Review = require('../models/Review');
const verifyToken = require('../middleware/verify-token');

router.get('/search', verifyToken, async (req, res) => {
  try {
    const { query } = req.query;
    const games = await igdbRequest(
      'games',
      `fields name, cover.url, summary, genres.name, platforms.name; where name ~ *"${query}"*; sort total_rating_count desc; limit 20;`
    );
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { igdbGameId, title, coverUrl, summary, platform, genre, status, notes } = req.body;

    let apiGame = await ApiGame.findOne({ igdbGameId });

    if (!apiGame) {
      apiGame = await ApiGame.create({
        igdbGameId, title, coverUrl, summary, platform, genre,
      });
    }

    const libraryItem = await LibraryItem.create({
      userId: req.user._id,
      gameId: apiGame._id,
      status,
      notes,
    });

    const populatedItem = await libraryItem.populate('gameId');
    res.status(201).json(populatedItem);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const library = await LibraryItem.find({ userId: req.user._id })
      .populate('gameId');
    res.status(200).json(library);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const item = await LibraryItem.findById(req.params.id);

    if (!item) return res.status(404).json({ err: 'Library item not found' });
    if (!item.userId.equals(req.user._id)) return res.status(403).json({ err: 'Not authorized' });

    await item.deleteOne();
    res.status(200).json({ message: 'Game removed from library' });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

router.get('/details/:igdbId', verifyToken, async (req, res) => {
  try {
    const igdbId = req.params.igdbId;

    const igdbData = await igdbRequest(
      'games',
      `where id = ${igdbId}; fields name, cover.url, summary, genres.name, platforms.name, first_release_date, total_rating; limit 1;`
    );

    const game = igdbData[0];
    if (!game) return res.status(404).json({ err: 'Game not found on IGDB' });

    const apiGame = await ApiGame.findOne({ igdbGameId: Number(igdbId) });

    let libraryItem = null;
    let reviews = [];

    if (apiGame) {
      libraryItem = await LibraryItem.findOne({
        userId: req.user._id,
        gameId: apiGame._id,
      });

      reviews = await Review.find({ gameId: apiGame._id })
        .populate('author', 'username');
    }

    res.status(200).json({ igdb: game, libraryItem, reviews });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

module.exports = router;