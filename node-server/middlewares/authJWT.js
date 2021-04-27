const jwt = require("jsonwebtoken");
const config = require("../config/auth.js");
const db = require("../models");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.json({
      status: false,
      message: "No token"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.json({
        status: false,
        message: "unauthorized !"
      });
    }
    req.userId = decoded.id;
    next();
  });
};

verifyTokenAxios = (req, res, next) => {
  let token = req.query.token;

  if (!token) {
    return res.json({
      status: false,
      message: "No token"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.json({
        status: false,
        message: "unauthorized !"
      });
    }
    next();
  });
};

const authJwt = {
  verifyToken,
  verifyTokenAxios
};
module.exports = authJwt;