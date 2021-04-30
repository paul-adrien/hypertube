const mongoose = require("mongoose");

const Movies = mongoose.model(
  "Movies",
  new mongoose.Schema({
    id: String,
    userId: String,
    hash: String,
    lastSeen: String,
    lastSeenS: Number,
    fullPath: String,
    partialPath: String,
    folder: String,
    file: String,
    size: String,
    quality: String,
    state: String,
    subtitles: String,
  })
);

module.exports = Movies;
