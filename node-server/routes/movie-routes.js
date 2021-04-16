const { authJwt } = require("../middlewares");
const express = require('express');
const router = express.Router();
const playerController = require("../controllers/player-controller");
const movieController = require("../controllers/movie-controller");

router.post('/api/movie/list', movieController.getListMovie);
router.get('/api/movie/watch/:imdb_id', playerController.streamTorrent);
router.get('/api/movie/subtitles/:imdb_id', playerController.getSubtitles);
router.get('/api/movie/subtitles/file/:imdb_id/:lang', playerController.getSubtitleFile);
router.get('/api/movie/detail/:imdb_id', movieController.getDetailMovie);

module.exports = router;