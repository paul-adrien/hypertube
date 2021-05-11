const { authJwt } = require("../middlewares");
const controller = require("../controllers/user-controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/user/forgotPass", controller.forgotPass_send);
  app.put("/user/changePass", controller.forgotPass_change);
  app.get("/token", [authJwt.verifyToken], controller.userBoard);
  app.get("/user/:id", [authJwt.verifyToken], controller.getProfile);
  app.put("/user/:id", [authJwt.verifyToken], controller.userUpdate);
};
