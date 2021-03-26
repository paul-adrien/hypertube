const { keys } = require("./indexConfig");

passport.use(
  new FortyTwoStrategy(
    {
      clientID: keys["42"].clientID,
      clientSecret: keys["42"].clientSecret,
      callbackURL: `http://localhost:8080/oauth/42/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      const user = await getUser({ userID: `42_${profile.id}` }, "userID");
      if (user) return done(null, user.userID);
      if (
        profile &&
        profile._json &&
        !(await checkUserExist(profile._json.login, profile._json.email))
      ) {
        const token = crypto.randomUUID();
        insertUser({
          userID: "42_" + profile._json.id,
          userFrom: "42",
          userName: profile._json.login,
          email: profile._json.email,
          image: profile._json.image_url,
          firstName: profile._json["first_name"],
          lastName: profile._json["last_name"],
          token,
        });
        return done(null, `42_${profile.id}`);
      } else return done(null, false);
    }
  )
);
