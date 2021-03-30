const { keys } = require("./auth.js");
const { checkUserExist } = require("../models/users.model");
const FortyTwoStrategy = require("passport-42").Strategy;
const passport = require("passport");

passport.use(
  new FortyTwoStrategy(
    {
      clientID: keys["42"].clientID,
      clientSecret: keys["42"].clientSecret,
      callbackURL: `http://localhost:8080/api/authenticate/42/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      console.log(
        await checkUserExist(profile._json.login, profile._json.email)
      );
      const user = await getUser({ userID: `42_${profile.id}` }, "userID");
      if (user) return done(null, user.userID);
      if (
        profile &&
        profile._json &&
        !(await checkUserExist(profile._json.login, profile._json.email))
      ) {
        const token = crypto.randomUUID();

        const user = new User({
          userName: profile._json.login,
          email: profile._json.email,
          lastName: profile._json.lastName,
          firstName: profile._json.firstName,
        });

        user.save((err, user) => {
          if (err) {
            return res.json({
              status: false,
              message: err,
            });
          }

          res.send({ message: "User was registered successfully!" });
        });
        return done(null, `42_${profile.id}`);
      } else return done(null, false);
    }
  )
);

passport.serializeUser((userID, done) => {
  done(null, userID);
});

passport.deserializeUser(async (userID, done) => {
  const user = await getUser({ userID }, "userName");
  if (user) return done(null, userID);
  return done(null, false);
});

module.exports = passport;
