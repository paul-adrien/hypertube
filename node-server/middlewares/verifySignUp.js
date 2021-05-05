const db = require("../models");
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    $and: [
      {
        userName: req.body.userName,
      },

      { id: { $not: { $regex: /42_/ } } },
      { id: { $not: { $regex: /google_/ } } },
      { id: { $not: { $regex: /git_/ } } },
    ],
  }).exec((err, user) => {
    if (err) {
      return res.json({
        status: false,
        message: err,
      });
    }

    if (user) {
      return res.json({
        status: false,
        message: "Failed! Username is already in use!",
      });
    }

    // Email
    User.findOne({
      $and: [
        {
          email: req.body.email,
        },

        { id: { $not: { $regex: /42_/ } } },
        { id: { $not: { $regex: /google_/ } } },
        { id: { $not: { $regex: /git_/ } } },
      ],
    }).exec((err, user) => {
      if (err) {
        return res.json({
          status: false,
          message: err,
        });
      }

      if (user) {
        return res.json({
          status: false,
          message: "Failed! Email is already in use!",
        });
      }

      next();
    });
  });
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
};

module.exports = verifySignUp;
