const { authJwt } = require("../middlewares");
const express = require('express');
const router = express.Router();
const playerController = require("../controllers/player-controller");
const movieController = require("../controllers/movie-controller");
const utilsController = require('../controllers/utils')

router.post('/api/movie/list', [authJwt.verifyToken], movieController.getListMovie);
router.post('/api/movie/addToFav', [authJwt.verifyToken], movieController.addToFav);
router.post('/api/movie/deleteFav', [authJwt.verifyToken], movieController.deleteFav);
router.get('/api/movie/getFav/:userId', [authJwt.verifyToken], movieController.getFav);
router.get('/api/movie/subtitles/:imdb_id', [authJwt.verifyToken], playerController.getSubtitles);
router.get('/api/movie/subtitles/file/:imdb_id/:lang', [authJwt.verifyTokenAxios], playerController.getSubtitleFile);
router.get('/api/movie/detail/:imdb_id', [authJwt.verifyToken], movieController.getDetailMovie);

router.post('/api/movie/download', [authJwt.verifyTokenAxios], (req, res) => {
    playerController.downloadTorrent({ res: res, params: req.body })
        .then(data => { data.res.send({ success: true, data: data.params }) })
        .catch(data => { data.res.send({ success: false, en_error: data.en_error, fr_error: data.fr_error }) })
})

router.get('/api/movie/convert/:hash/:quality', [authJwt.verifyTokenAxios], (req, res) => {
    playerController.getInfos({ res: res, params: req.params, token: req.query.token })
        .then(playerController.convert)
        .catch(data => { data.res.send({ success: false, en_error: data.en_error, fr_error: data.fr_error }) })
})

router.get('/api/movie/stream/:hash', [authJwt.verifyTokenAxios], (req, res) => {
    req.body.hash = req.params.hash
    req.body.range = req.headers.range
    playerController.getInfos({ res: res, params: req.body })
        .then(playerController.stream)
        .catch(data => { data.res.send({ success: false, en_error: data.en_error, fr_error: data.fr_error }) })
})

module.exports = router;