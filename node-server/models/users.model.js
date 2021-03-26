const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    userName: String,
    email: String,
    lastName: String,
    firstName: String,
    password: String
  })
);

module.exports = User;