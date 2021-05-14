const { updateUser, getUser } = require("../models/lib-user.model");
var nodemailer = require("nodemailer");
const User = require("../models/users.model");
var bcrypt = require("bcryptjs");

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

exports.forgotPass_send = async (req, res) => {
  const email = req.body.email;
  var user = new User;

  if ((user = await getUser({ email: email }))) {
    var rand = Math.floor(Math.random() * 100 + 54);
    var link = "http://localhost:8081/forgotPass/" + rand;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "42.noreplymatcha@gmail.com",
        pass: "GguyotPlaurent76",
      },
    });

    var mailOptions = {
      from: "42.noreplymatcha@gmail.com",
      to: email,
      subject: "Reset password",
      html:
        "Hello,<br> Please Click on the link to reset your password.<br><a href=" +
        link +
        ">Click here to verify</a>",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
      } else {
      }
    });
    user.rand = rand;
    if (await updateUser(user.id, user)) {
      res.json({
        status: true,
        message: "email was send",
      });
    } else {
      res.json({
        status: false,
        message: "error with mongodb update",
      });
    }
  } else {
    res.json({
      status: false,
      message: "they are no account with this email",
    });
  }
};

exports.forgotPass_change = async (req, res) => {
  const { email, password, id } = req.body;
  const user = await getUser({ email: email });
  if (user) {
    user.password = bcrypt.hashSync(password, 8);
    if (user.rand == id) {
      if (await updateUser(user.id, user)) {
        res.json({
          status: true,
          message: "Password was changed",
        });
      } else {
        res.json({
          status: false,
          message: "user doesn't exist",
        });
      }
    } else {
      res.json({
        status: false,
        message: "wrong link",
      });
    }
  } else {
    res.json({
      status: false,
      message: "user doesn't exist",
    });
  }
};

