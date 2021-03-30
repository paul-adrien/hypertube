const { verifySignUp } = require("../middlewares");
const passport = require("../config/passport-config");

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
  app.get(
    "/api/authenticate/42/callback",
    passport.authenticate("42", { failureRedirect: "/login" }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect("/home");
    }
  );
};
