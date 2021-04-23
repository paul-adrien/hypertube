const { authJwt } = require("../middlewares");
const express = require('express');
const router = express.Router();
const playerController = require("../controllers/player-controller");
const movieController = require("../controllers/movie-controller");
const utilsController = require('../controllers/utils')

router.post('/api/movie/list', movieController.getListMovie);
router.get('/api/movie/watch/:imdb_id', playerController.streamTorrent);
router.get('/api/movie/subtitles/:imdb_id', playerController.getSubtitles);
router.get('/api/movie/subtitles/file/:imdb_id/:lang', playerController.getSubtitleFile);
router.get('/api/movie/detail/:imdb_id', movieController.getDetailMovie);

/**
 * Allow the user to download and stream the choosen movie
 *      ---> `data` : { `authenticatedToken`, `torrent`, `movieId` }
 *          ---> use a middleware to see if `authenticatedToken` exist and match an user {{ isUser }}
 *          ---> check if `torrent` && `movieId` exists and are well-formated {{ utils::checkParams }}
 *          ---> download torrent {{ torrent::downloadTorrent }}
 *          ---> get subtitles {{ torrent::downloadSubtitles }}
 *          -----> error handling
 */
router.post('/download', (req, res) => {
    utilsController.checkParams(req, res, ['hash', 'movieId'])
        .then(playerController.downloadTorrent)
        .then(playerController.saveTorrent)
        .then(data => { data.res.send({ success: true, data: data.params }) })
        .catch(data => { data.res.send({ success: false, en_error: data.en_error, fr_error: data.fr_error }) })
})


/**
 * Convert the flux thanks to `/stream/:hash`
 *      ---> `params` : { `hash`, `quality` }
 *          ---> convert into the right quality {{ torrent:convert }}
 *          -----> error handling
 */
router.get('/convert/:hash/:quality', (req, res) => {
    req.body.hash = req.params.hash
    req.body.quality = req.params.quality
    utilsController.checkParams(req, res, ['hash', 'quality'])
        .then(playerController.getInfos)
        .then(playerController.convert)
        .catch(data => { data.res.send({ success: false, en_error: data.en_error, fr_error: data.fr_error }) })
})

/**
 * Pipe a flux
 *      ---> `params` : { `hash` }
 *          ---> pipe the movie's flux thanks to the final file's movie or the torrent_engine if the download isn't over yet {{ torrent::stream }}
 *          -----> error handling
 */
router.get('/stream/:hash', (req, res) => {
    req.body.hash = req.params.hash
    req.body.range = req.headers.range
    utilsController.checkParams(req, res, ['hash'])
        .then(playerController.getInfos)
        .then(playerController.stream)
        .catch(data => { data.res.send({ success: false, en_error: data.en_error, fr_error: data.fr_error }) })
})

module.exports = router;