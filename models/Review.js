const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiGame",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
        required: true,
    },
    Text: String,
  },
    {
        timestamps: true,
    },
    );


    // One review per user per game
reviewSchema.index({ gameId: 1, author: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);