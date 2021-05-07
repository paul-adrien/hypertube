const mongoose = require("mongoose");

const Comment = mongoose.model(
  "Comment",
  new mongoose.Schema({
    comment: String,
    imdb_id: String,
    userId: String,
    date: String,
  })
);

module.exports = Comment;
