const config = require("../config/auth");
const db = require("../models");
const User = db.user;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  User.findOne({
    $and: [
      {
        userName: "gguyot",
      },

      { id: { $not: { $regex: /42_/ } } },
      { id: { $not: { $regex: /google_/ } } },
    ],
  }).exec((err, user) => {
    if (user) {
      return res.json({
        status: false,
        message: "userName already exist.",
      });
    }
  });
  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  user.id = user._id;

  user.save((err, user) => {
    if (err) {
      return res.json({
        status: false,
        message: err,
      });
    }
    res.send({ message: "User was registered successfully!" });
  });
};

exports.signin = (req, res) => {
  User.findOne({
    $and: [
      {
        userName: "gguyot",
      },

      { id: { $not: { $regex: /42_/ } } },
      { id: { $not: { $regex: /google_/ } } },
    ],
  }).exec((err, user) => {
    if (err) {
      return res.json({
        status: false,
        message: err,
      });
    }

    if (!user) {
      return res.json({
        status: false,
        message: "User Not found.",
      });
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.json({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400, // 24 hours
    });

    res.json({
      status: true,
      id: user.id,
      userName: user.userName,
      email: user.email,
      lastName: user.lastName,
      firstName: user.firstName,
      accessToken: token,
    });
  });
};
