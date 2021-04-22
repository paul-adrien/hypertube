const User = require("./users.model");

const getUser = async function (query) {
  if (query !== null) {
    const user = await User.findOne(query).exec();
    return user;
  } else return null;
};

const checkUserExist = async function (username, email) {
  if (username === null || email === null) {
    return false;
  }
  const user = await User.findOne({
    $or: [{ userName: username }, { email: email }],
  }).exec();
  return !!user;
};

module.exports = { checkUserExist, getUser };
