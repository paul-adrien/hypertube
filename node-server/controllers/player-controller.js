const torrentStream = require("torrent-stream");
const FFmpeg = require("fluent-ffmpeg");
const FFmpegPath = require('@ffmpeg-installer/ffmpeg').path;
FFmpeg.setFfmpegPath(FFmpegPath)
const fs = require("fs");
const path = require("path");
const mainExtensions = [".mp4", "webm"];
const { trackers } = require("../config/stream");
const got = require("got");
const cheerio = require("cheerio");
const unzipper = require("unzipper").Parse;
const streamz = require("streamz");
const srt2vtt = require("srt-to-vtt");
const config = require("../config/stream");
const db = require("../models");
const Movies = db.movies;


module.exports.saveTorrent = (data) => {
  return new Promise((fullfil, reject) => {
    Movies.findOne({ id: data.params.movieId, hash: data.params.hash }, (err, result) => {
      if (err) reject({ res: data.res, en_error: 'An error occured with the database', fr_error: 'Un problème est survenu avec la base de donnée' })
      else if (result) {
        if (data.params.state) {
          Movies.updateOne({ id: data.params.movieId, hash: data.params.hash }, { $set: { lastSeen: new Date(), state: data.params.state } }, (err, result) => {
            if (err) reject({ res: data.res, en_error: 'An error occured with the database', fr_error: 'Un problème est survenu avec la base de donnée' })
            else fullfil(data)
          })
        } else {
          Movies.updateOne({ id: data.params.movieId, hash: data.params.hash }, { $set: { lastSeen: new Date() } }, (err, result) => {
            if (err) reject({ res: data.res, en_error: 'An error occured with the database', fr_error: 'Un problème est survenu avec la base de donnée' })
            else fullfil(data)
          })
        }
      } else {
        const movies = new Movies({
          id: data.params.movieId,
          hash: data.params.hash,
          lastSeen: new Date(),
          fullPath: data.params.fileInfo.fullPath,
          partialPath: data.params.fileInfo.partialPath,
          folder: data.params.fileInfo.folder,
          file: data.params.fileInfo.file,
          state: data.params.state,
          size: data.params.size,
          quality: data.params.quality
        })
        movies.save((err, result) => {
          if (err) reject({ res: data.res, en_error: 'An error occured with the database', fr_error: 'Un problème est survenu avec la base de donnée' })
          else fullfil(data)
        })
      }
    })
  })
}

module.exports.getInfos = (data) => {
  return new Promise((fullfil, reject) => {
    Movies.findOne({ hash: data.params.hash }, (err, result) => {
      if (err) reject({ res: data.res, en_error: 'An error occured with the database', fr_error: 'Un problème est survenu avec la base de donnée' })
      else if (result) { data.params.info = result; fullfil(data) }
      else reject({ res: data.res, en_error: 'This hash doesn\'t match any torrent, sorry', fr_error: 'Ce magnet ne correspond à aucun torrent, désolé' })
    })
  })
}

module.exports.convert = (data) => {
  return new Promise((fullfil, reject) => {
    if (data.params.quality === 'x264' || data.params.quality === 'XviD') data.params.quality = '480p'
    if (data.params.quality.search('BD') >= 0) data.params.quality = '1080p'
    if (data.params.quality === '240p' || data.params.quality === '360p' || data.params.quality === '480p' || data.params.quality === '720p' || data.params.quality === '1080p') {
      options = [{ '240p': { size: '426x240', bitrate_video: '365k', bitrate_audio: '128k' } },
      { '360p': { size: '640x360', bitrate_video: '730k', bitrate_audio: '196k' } },
      { '480p': { size: '854x480', bitrate_video: '2000k', bitrate_audio: '196k' } },
      { '720p': { size: '1280x720', bitrate_video: '3000k', bitrate_audio: '196k' } },
      { '1080p': { size: '1920x1080', bitrate_video: '4500k', bitrate_audio: '196k' } }]
      let settings = options.find(setting => { return setting[data.params.quality] })[data.params.quality.toString()]
      let convert = FFmpeg(`http://localhost:8080/stream/${data.params.hash}`)
        .format('webm')
        .size(settings.size)
        .videoCodec('libvpx')
        .videoBitrate(settings.bitrate_video)
        .audioCodec('libopus')
        .audioBitrate(settings.bitrate_audio)
        .outputOptions(['-quality realtime'])
        .audioChannels(2)
        .on('error', (err) => {
          convert.kill()
          if (err !== 'Output stream closed') reject({ err: data.res, en_error: err })
        });
      convert.pipe(data.res)
      fullfil(data)
    } else reject({ res: data.res, en_error: 'This quality isn\'t available', fr_error: 'Cette qualité n\'est pas disponible' })
  })
}

module.exports.stream = (data) => {
  return new Promise((fullfil, reject) => {
    if (data.params.info.state === 'over') {
      let path = data.params.info.fullPath
      fs.stat(path, (err, stats) => {
        if (err) reject({ res: data.res, error: 'Unavailable path' })
        else {
          let fileSize = stats.size
          if (data.params.range) {
            let parts = data.params.range.replace(/bytes=/, '').split('-')
            let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            let start = parseInt(parts[0], 10) < end ? parseInt(parts[0], 10) : 0
            let chunksize = (end - start) + 1
            let file = fs.createReadStream(path, { start, end })
            let headers = { 'Content-Range': `bytes ${start}-${end}/${fileSize}`, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/webm' }
            data.res.writeHead(206, headers)
            file.pipe(data.res)
          } else {
            let file = fs.createReadStream(path)
            let headers = { 'Content-Length': fileSize, 'Content-Type': 'video/webm' }
            data.res.writeHead(200, headers)
            file.pipe(data.res)
          }
          fullfil(data)
        }
      })
    } else {
      let path = torrent_engine.find(torrent => torrent.hash === data.params.hash).file
      let fileSize = path.length
      if (data.params.range) {
        let parts = data.params.range.replace(/bytes=/, '').split('-')
        let start = parseInt(parts[0], 10)
        let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
        let chunksize = (end - start) + 1
        let file = path.createReadStream({ start, end })
        let headers = { 'Content-Range': `bytes ${start}-${end}/${fileSize}`, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/webm' }
        data.res.writeHead(206, headers)
        file.pipe(data.res)
      } else {
        let file = path.createReadStream()
        let headers = { 'Content-Length': fileSize, 'Content-Type': 'video/webm' }
        data.res.writeHead(200, headers)
        file.pipe(data.res)
      }
      fullfil(data)
    }
  })
}


module.exports.downloadTorrent = (data) => {
  return new Promise((fullfil, reject) => {
    console.log('test', data.params.hash, data.params.movieId);
    const path = `../movies/${data.params.movieId}`;
    const options = {
      path,
      tracker: true,
      trackers,
      uploads: 10, verify: true
    };
    let engine = torrentStream(`magnet:?xt=urn:btih:${data.params.hash}`, options)
    let started = false
    engine.on('ready', () => {
      let index = engine.files.indexOf(engine.files.reduce((a, b) => (a.length > b.length ? a : b)))
      engine.files.forEach((file, ind) => {
        if (ind === index) { file.select(); console.info(`Chosen file: ${file.name}`) }
        else file.deselect()
      })
      data.params.file = engine.files[index]
      data.params.fileInfo = { fullPath: `${engine.path}/${data.params.file.path}`, partialPath: `${engine.path}/${engine.torrent.name}`, folder: engine.torrent.name, file: data.params.file.name }
      data.params.state = 'waiting'
      torrent_engine.push({ hash: data.params.hash, file: data.params.file, engine: engine })
      fullfil(data)
    })
    engine.on('download', piece => {
      started = true
      if (started) {
        data.params.state = 'downloading'
        try {
          this.saveTorrent(data)
        } catch (err) { reject({ res: data.res, en_error: 'An error occured with the database', fr_error: 'Un problème est survenu avec la base de donnée' }) }
      }
    })
    engine.on('idle', fn => {
      data.params.state = 'over'
      try {
        this.saveTorrent(data); let ind = torrent_engine.findIndex(engine => { return engine.hash === data.params.torrent.hash }); torrent_engine.splice(ind, 1)
      } catch (err) { reject({ res: data.res, en_error: 'An error occured with the database', fr_error: 'Un problème est survenu avec la base de donnée' }) }
    });
  })
}

function convertYTS(file, start, end) {
  try {
    const convertedFile = new FFmpeg(
      file.createReadStream({
        start,
        end,
      })
    )
      .videoCodec("libvpx")
      .audioCodec("libvorbis")
      .format("mp4")
      .audioBitrate(128)
      .videoBitrate(8000)
      .outputOptions([`-threads 5`, "-deadline realtime", "-error-resilient 1"])
      .on("error", (err) => {
        console.log(err);
      });
    return convertedFile;
  } catch (err) {
    return file.createReadStream({
      start,
      end,
    });
  }
}

async function convertRARBG(file, start, end, quality) {
  try {
    if (quality === 'x264' || quality === 'XVID') quality = '480'
    if (quality.search('BD') >= 0) quality = '1080'
    if (quality === '240' || quality === '360' || quality === '480' || quality === '720' || quality === '1080') {
      options = [{ '240': { size: '426x240', bitrate_video: '365k', bitrate_audio: '128k' } },
      { '360': { size: '640x360', bitrate_video: '730k', bitrate_audio: '196k' } },
      { '480': { size: '854x480', bitrate_video: '2000k', bitrate_audio: '196k' } },
      { '720': { size: '1280x720', bitrate_video: '3000k', bitrate_audio: '196k' } },
      { '1080': { size: '1920x1080', bitrate_video: '4500k', bitrate_audio: '196k' } }]
      let settings = options.find(setting => { return setting[quality] })[quality.toString()]
      const convert = new FFmpeg(
        file.createReadStream({
          start,
          end,
        })
      )
        .format('webm')
        .size(settings.size)
        .videoCodec('libvpx')
        .videoBitrate(settings.bitrate_video)
        .audioCodec('libopus')
        .audioBitrate(settings.bitrate_audio)
        .outputOptions([`-threads 5`, "-deadline realtime", "-error-resilient 1"])
        .audioChannels(2)
        .on('error', (err) => {
          console.log(err)
        });
      return (convert)
    } else {
      throw new Error("error convert");
    }
  } catch (err) {
    return file.createReadStream({
      start,
      end,
    });
  }
}

function findStream(engine) {
  return new Promise((resolve, reject) => {
    const files = engine.torrent.files;
    const NUMBER_OF_FILES = files.length;
    if (NUMBER_OF_FILES === 0) throw new Error("No files found");
    let movie = {};
    console.log("Looking for video file...");
    files.forEach(async (file, index) => {
      if (movie.isFound === true) return;
      let name = file.name;
      name = name.toUpperCase();
      console.log(name);
      if (!name.match(/\.(MP4|WEBM|AVI|MKV|MPEG|MPG|MOV|QT|FLV)$/)) return;
      movie.engine = engine.files[index];
      movie.file = files[index];
      movie.isFound = true;
    });
    resolve(movie);
  });
}

async function setupEngine(magnet, options) {
  const engine = torrentStream(magnet, options);
  return new Promise((resolve, reject) => {
    engine.on("ready", () => {
      console.log("Engine ready");
      return resolve(engine);
    });
    engine.on("error", () => {
      console.log("Engine Not Ready");
      return reject("Engine Error");
    });
  });
}

exports.streamTorrent = async (req, res) => {
  console.log(req.headers);
  wrongType = false;
  try {
    const { hash, quality } = req.query;
    const { imdb_id } = req.params;
    const magnet = `magnet:?xt=urn:btih:${hash}`;
    const path = `../movies/${imdb_id}`;
    const options = {
      path,
      tracker: true,
      trackers,
      uploads: 10, verify: true
    };
    console.log("test");
    const engine = await setupEngine(magnet, options)
      .then(async (engineInstance) => {
        const movie = await findStream(engineInstance);
        if (!movie.isFound) throw new Error("Movie Not found");
        console.log("Stream Found...");
        //const updateDate = await movieModel.findOneAndUpdate({imdbCode: imdb},{$set: {WatchedOn:new Date(), File: `./movies/${imdb}`}},{ upsert: true, new: true})
        //if(!updateDate) throw new Error("Something Went Wrong!");
        var file_type = movie.file.name.split(".").pop();
        if (file_type !== "mp4" && file_type !== "webm") {
          file_type = "webm";
          wrongType = true;
        }
        console.log(file_type);
        if (!req.headers.range || !movie.file.length || !file_type)
          throw new Error(
            `Header could not be created headerRange: ${req.headers.range}, totalBytes: ${movie.file.length}, Type: ${file_type}`
          );
        console.log("test7");
        const position = req.headers.range.replace(/bytes=/, "").split("-");
        const start = parseInt(position[0], 10);
        const end = position[1]
          ? parseInt(position[1], 10)
          : movie.file.length - 1;
        let chunksize = end - start;
        const ContentHeader = {
          Header: {
            "Content-Range": `bytes ${start}-${end}/${movie.file.length}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunksize,
            "Content-Type": `video/webm`,
          },
          start,
          end,
        };
        console.log(ContentHeader);
        res.writeHead(206, ContentHeader.Header);
        let movieStream;
        // if (wrongType)
        movieStream = await convertRARBG(
          movie.engine,
          ContentHeader.start,
          ContentHeader.end,
          quality
        );
        // else
        //   movieStream = movie.engine.createReadStream({
        //     start: ContentHeader.start,
        //     end: ContentHeader.end,
        //   });
        console.log({
          "Start: ": ContentHeader.start,
          "End: ": ContentHeader.end,
        });
        return movieStream.pipe(res).on("close", () => {
          console.log("Pipe closed...");
          return res.end();
        });
      })
      .catch((error) => {
        console.log(error);
        res.end();
      });
  } catch (err) {
    console.log(err);
    res.end();
  }
};

async function getSubsLink(imdb_id) {
  try {
    const uri = `https://yts-subs.com/movie-imdb/${imdb_id}`;
    const data = await got(uri);
    const $ = await cheerio.load(data.body);
    let arrFR = [];
    let arrEN = [];
    $("a")
      .filter(function () {
        if (!$(this).attr("href")) throw new Error("Subtitles Not Found");
        if ($(this).attr("href").includes("french"))
          arrFR.push($(this).attr("href"));
        if ($(this).attr("href") && $(this).attr("href").includes("english"))
          arrEN.push($(this).attr("href"));
      })
      .next()
      .text();
    return {
      French:
        arrFR.length > 0 &&
        `https://yifysubtitles.org/subtitle/${arrFR[0].split("/")[2]}.zip`,
      English:
        arrEN.length > 0 &&
        `https://yifysubtitles.org/subtitle/${arrEN[0].split("/")[2]}.zip`,
    };
  } catch (e) {
    return null;
  }
}

async function DlSubs(link, lang, imdb_id) {
  console.log(`downloading ${lang} subtitle...`);

  const download = got.stream(link);
  download.on("error", (error) => {
    console.error(`Download failed: ${error.message}`);
  });

  download.pipe(unzipper()).pipe(
    streamz(
      async (entry) => {
        console.log(`streaming to save to file...`);
        const parsedPath = path.parse(entry.path);
        const filesExist = await fs.existsSync(
          `../movies/${imdb_id}/subs/${lang}`
        );
        console.log(`fileExist? => ${filesExist}...`);
        if (!filesExist)
          await fs.mkdirSync(`../movies/${imdb_id}/subs/${lang}`, {
            recursive: true,
          });
        console.log(
          `${parsedPath.name}.${parsedPath.ext} Saving as ../movies/${imdb_id}/subs/${lang}/${imdb_id}.srt...`
        );
        return parsedPath.ext == ".srt"
          ? entry
            .pipe(srt2vtt())
            .pipe(
              fs.createWriteStream(
                `../movies/${imdb_id}/subs/${lang}/${imdb_id}.vtt`
              )
            )
            .on("error", (e) => {
              throw new Error(e.message);
            })
          : entry
            .pipe(
              fs.createWriteStream(
                `../movies/${imdb_id}/subs/${lang}/${imdb_id}.vtt`
              )
            )
            .on("error", (e) => {
              throw new Error(e.message);
            });
      },
      {
        catch: (e) => console.log(`Streamz Error: ${e.message}`),
      }
    )
  );
}

exports.getSubtitles = async (req, res) => {
  const imdb_id = req.params.imdb_id;
  let existingSubs = [];
  const enfilesExist = await fs.existsSync(
    `../movies/${imdb_id}/subs/en/${imdb_id}.vtt`
  );
  const frfilesExist = await fs.existsSync(
    `../movies/${imdb_id}/subs/fr/${imdb_id}.vtt`
  );
  if (enfilesExist && frfilesExist) {
    existingSubs.push({
      lang: "english",
      langShort: "en",
      path: `../movies/${imdb_id}/subs/en/${imdb_id}.vtt`,
      fileName: `${imdb_id}.vtt`,
    });
    existingSubs.push({
      lang: "french",
      langShort: "fr",
      path: `../movies/${imdb_id}/subs/fr/${imdb_id}.vtt`,
      fileName: `${imdb_id}.vtt`,
    });
    return res.json({
      status: true,
      subs: existingSubs,
    });
  }
  if (!enfilesExist)
    await fs.mkdirSync(`../movies/${imdb_id}/subs/en/`, { recursive: true });
  if (!frfilesExist)
    await fs.mkdirSync(`../movies/${imdb_id}/subs/fr/`, { recursive: true });
  if ((links = await getSubsLink(imdb_id))) {
    subs = [];
    if (links.English) {
      await DlSubs(links.English, "en", imdb_id);
      subs.push({
        lang: "english",
        langShort: "en",
        path: `../movies/${imdb_id}/subs/en/${imdb_id}.vtt`,
        fileName: `${imdb_id}.vtt`,
      });
    }
    if (links.French) {
      await DlSubs(links.French, "fr", imdb_id);
      subs.push({
        lang: "french",
        langShort: "fr",
        path: `../movies/${imdb_id}/subs/fr/${imdb_id}.vtt`,
        fileName: `${imdb_id}.vtt`,
      });
    }
    return res.json({
      status: true,
      subs: subs,
    });
  }
  console.log("no subs available");
  return res.json({
    status: true,
    subs: null,
  });
};

exports.getSubtitleFile = (req, res) => {
  var path = `/${req.params.imdb_id}/subs/${req.params.lang}/${req.params.imdb_id}.vtt`;
  console.log(path);
  res.sendFile(config.movie_folder + path, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    } else {
      console.log("Sent:", config.movie_folder + path);
    }
  });
};
