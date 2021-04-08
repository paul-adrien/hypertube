const { verifySignUp } = require("../middlewares");
const passport = require("../config/passport-config");
const config = require("../config/auth");
var jwt = require("jsonwebtoken");
const { getUser } = require("../models/lib-user.model");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept, *"
    );
    res.header("Access-Control-Allow-Origin", "*");
    next();
  });

  app.get("/api/authenticate/42", passport.authenticate("42"));
  app.get("/api/authenticate/42/callback", (req, res, next) => {
    console.log(req);
    passport.authenticate(
      "42",
      {
        failureRedirect: "http://localhost:8081/login",
      },
      async (err, userId) => {
        // Successful authentication, redirect home.
        const userDb = await getUser({ id: userId });
        console.log(userDb);

        const token = jwt.sign({ id: userDb._id }, config.secret, {
          expiresIn: 86400, // 24 hours
        });

        return res.redirect(
          "http://localhost:8081/home?data=" +
            encodeURI(
              JSON.stringify({
                user: userDb,
                token: token,
              })
            )
        );
      }
    )(req, res, next);
  });
};
