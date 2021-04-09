const { keys } = require("./auth.js");
const { checkUserExist, getUser } = require("../models/lib-user.model");
const FortyTwoStrategy = require("passport-42").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/users.model");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config/auth");

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
      const user = await getUser({ id: `42_${profile.id}` });
      if (user && user !== null) return done(null, user.id);
      if (
        profile &&
        profile._json &&
        !(await checkUserExist(profile._json.login, profile._json.email))
      ) {
        const user = new User({
          id: `42_${profile.id}`,
          userName: profile._json.login,
          email: profile._json.email,
          lastName: profile._json.last_name,
          firstName: profile._json.first_name,
          picture: profile._json.image_url,
        });

        user.save((err, user) => {
          if (err) {
            return res.json({
              status: false,
              message: err,
            });
          }

          const token = jwt.sign({ id: profile._id }, config.secret, {
            expiresIn: 86400, // 24 hours
          });
        });
        return done(null, `42_${profile.id}`);
      } else return done(null, false);
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: keys["google"].clientID,
      clientSecret: keys["google"].clientSecret,
      callbackURL: `http://localhost:8080/api/authenticate/google/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log(profile);
      console.log(
        await checkUserExist(profile._json.login, profile._json.email)
      );
      const user = await getUser({ id: `google_${profile.id}` });
      if (user && user !== null) return done(null, user.id);
      if (
        profile &&
        profile._json &&
        !(await checkUserExist(profile._json.login, profile._json.email))
      ) {
        const user = new User({
          id: `google_${profile.id}`,
          userName: profile._json.name,
          email: profile._json.email,
          lastName: profile._json.family_name,
          firstName: profile._json.given_name,
          picture: profile._json.picture,
        });

        user.save((err, user) => {
          if (err) {
            return res.json({
              status: false,
              message: err,
            });
          }

          const token = jwt.sign({ id: profile._id }, config.secret, {
            expiresIn: 86400, // 24 hours
          });
        });
        return done(null, `google_${profile.id}`);
      } else return done(null, false);
    }
  )
);

passport.serializeUser((userID, done) => {
  done(null, userID);
});

passport.deserializeUser(async (userID, done) => {
  const user = await getUser({ id: userID });
  if (user) return done(null, userID);
  return done(null, false);
});

module.exports = passport;
