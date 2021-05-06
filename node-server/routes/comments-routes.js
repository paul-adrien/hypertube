const { authJwt } = require("../middlewares");
const controller = require("../controllers/comments-controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/comment/:imdb_id", [authJwt.verifyToken], controller.addComments);
  app.get("/comment/:imdb_id", [authJwt.verifyToken], controller.getComments);
}