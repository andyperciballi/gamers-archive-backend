const { text } = require("express");
const mongoose = require("mongoose");

const apiGameSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      default: "IGDB",
    },
    igdbGameId: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    coverUrl: String,
    summary: String,
    releaseDate: Date,
    rating: Number,

    platform:
      [{
        type: String,
      }],
    genre:
      [{
        type: String,
      }],
  },
  {
    timestamps: true,
  },
);

const ApiGame = mongoose.model('ApiGame', apiGameSchema)

module.exports = ApiGame