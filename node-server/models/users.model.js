const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    userName: String,
    email: String,
    lastName: String,
    firstName: String,
    password: String,
  })
);

const checkUserExist = async function (username, email) {
  const user = await User.findOne({
    $or: [{ userName: username }, { email: email }],
  }).exec();
  return user;
};

module.exports = { User, checkUserExist };
