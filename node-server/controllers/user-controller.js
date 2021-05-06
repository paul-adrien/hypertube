const { updateUser, getUser } = require("../models/lib-user.model");

exports.userBoard = (req, res) => {
  res.json({
    status: true,
    message: "user was log",
  });
};

exports.userUpdate = async (req, res) => {
  if (await updateUser(req.params.id, req.body)) {
    const user = await getUser({ id: req.params.id });
    res.json(user);
  } else {
    res.json({
      status: false,
      message: "user update error",
    });
  }
};

exports.getProfile = async (req, res) => {
  const user = await getUser({ id: req.params.id });
  if (user) {
    res.json(user);
  } else {
    res.json({
      status: false,
      message: "user doesn't exist",
    });
  }
};
