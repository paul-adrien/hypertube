const { authJwt } = require("../middlewares");
const express = require('express');
const router = express.Router();
const playerController = require("../controllers/player-controller");

router.get('/api/movie/watch/:imdb_id', playerController.streamTorrent);
router.get('/api/movie/subtitles/:imdb_id', playerController.getSubtitles);
router.get('/api/movie/subtitles/file/:imdb_id/:lang', playerController.getSubtitleFile);

module.exports = router;