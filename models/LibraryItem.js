const { text } = require("express");
const mongoose = require("mongoose");

const libraryItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ApiGame",
      required: true,
    },
    status: {
      type: String,
      enum: ["Want to Play", "Playing", "Completed", "On Hold", "Dropped"],
      default: "Want to Play",
    },
    hoursPlayed: {
      type: Number,
      default: 0,
    },
    notes: String,
    owned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const LibraryItem = mongoose.model('LibraryItem', libraryItemSchema)

module.exports = LibraryItem