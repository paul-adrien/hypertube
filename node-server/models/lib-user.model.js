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

const updateUser = async function (userId, user) {
  const res = await User.updateOne({ id: userId }, { $set: user });
  console.log(res);
  return res;
};

module.exports = { checkUserExist, getUser, updateUser };
