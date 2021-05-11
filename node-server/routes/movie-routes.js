const { authJwt } = require("../middlewares");
const express = require("express");
const router = express.Router();
const playerController = require("../controllers/player-controller");
const movieController = require("../controllers/movie-controller");
const utilsController = require("../controllers/utils");

router.get("/movie/list", movieController.getListMovie);

router.post(
  "/movie/:imdb_id/favorite",
  [authJwt.verifyToken],
  movieController.addToFav
);
router.delete(
  "/movie/:imdb_id/favorite/:user_id",
  [authJwt.verifyToken],
  movieController.deleteFav
);
router.get(
  "/movie/favorite/:user_id",
  [authJwt.verifyToken],
  movieController.getFav
);

router.get(
  "/movie/watched/:user_id",
  [authJwt.verifyToken],
  movieController.getWatched
);

router.post(
  "/movie/:imdb_id/subtitles",
  [authJwt.verifyToken],
  playerController.getSubtitles
);
router.get(
  "/movie/:imdb_id/subtitles/file/:lang",
  [authJwt.verifyTokenAxios],
  playerController.getSubtitleFile
);

router.get(
  "/movie/:imdb_id/detail",
  [authJwt.verifyToken],
  movieController.getDetailMovie
);

router.post("/movie/download", [authJwt.verifyTokenAxios], (req, res) => {
  playerController
    .downloadTorrent({ res: res, params: req.body })
    .then((data) => {
      data.res.send({ success: true, data: data.params });
    })
    .catch((data) => {
      data.res.send({
        success: false,
        en_error: data.en_error,
        fr_error: data.fr_error,
      });
    });
});

router.get(
  "/movie/convert/:hash/:quality",
  [authJwt.verifyTokenAxios],
  (req, res) => {
    playerController
      .getInfos({ res: res, params: req.params, token: req.query.token })
      .then(playerController.convert)
      .catch((data) => {
        data.res.send({
          success: false,
          en_error: data.en_error,
          fr_error: data.fr_error,
        });
      });
  }
);

router.get("/movie/stream/:hash", [authJwt.verifyTokenAxios], (req, res) => {
  req.body.hash = req.params.hash;
  req.body.range = req.headers.range;
  playerController
    .getInfos({ res: res, params: req.body })
    .then(playerController.stream)
    .catch((data) => {
      data.res.send({
        success: false,
        en_error: data.en_error,
        fr_error: data.fr_error,
      });
    });
});

module.exports = router;
