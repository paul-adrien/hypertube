const User = require("./users.model");

const getUser = async function (query) {
  if (query !== null) {
    const user = await User.findOne(query).exec();
    return user;
  } else return null;
};

const checkUserExist = async function (userId) {
  if (userId === null) {
    return false;
  }
  const user = await User.findOne({
    id: userId,
  }).exec();
  return !!user;
};

const updateUser = async function (userId, user) {
  const res = await User.updateOne({ id: userId }, { $set: user }).exec();
  return res;
};

const checkUserSeeMovie = async function (userId, imdb_code) {
  const see = await User.findOne(
    { id: userId, moviesWatched: imdb_code },
    "state"
  ).exec();
  return !!see;
};

module.exports = { checkUserExist, getUser, updateUser, checkUserSeeMovie };
