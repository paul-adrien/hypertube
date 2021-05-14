const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    userName: String,
    email: String,
    lastName: String,
    firstName: String,
    password: String,
    id: String,
    picture: String,
    moviesWatched: Array,
    rand: Number,
    lang: String,
  })
);

module.exports = User;
