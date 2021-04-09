const User = require("./users.model");

const getUser = async function (query) {
  const user = await User.findOne(query).exec();
  console.log(user);
  return user;
};

const checkUserExist = async function (username, email) {
  const user = await User.findOne({
    $or: [{ userName: username }, { email: email }],
  }).exec();
  return !!user;
};

module.exports = { checkUserExist, getUser };
