const db = require("../models");
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    username: req.body.userName
  }).exec((err, user) => {
    if (err) {
      return res.json({
        status: false,
        message: err
      });
    }

    if (user) {
      return res.json({
        status: false,
        message: "Failed! Username is already in use!"
      });
    }

    // Email
    User.findOne({
      email: req.body.email
    }).exec((err, user) => {
      if (err) {
        return res.json({
          status: false,
          message: err
        });
      }

      if (user) {
        return res.json({
          status: false,
          message: "Failed! Email is already in use!"
        });
      }

      next();
    });
  });
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail
};

module.exports = verifySignUp;