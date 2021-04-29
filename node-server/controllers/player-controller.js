const torrentStream = require("torrent-stream");
const FFmpeg = require("fluent-ffmpeg");
const FFmpegPath = require("@ffmpeg-installer/ffmpeg").path;
FFmpeg.setFfmpegPath(FFmpegPath);
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
  return new Promise((resolve, reject) => {
    Movies.findOne(
      { id: data.params.movieId, hash: data.params.hash },
      (err, result) => {
        if (err)
          reject({
            res: data.res,
            en_error: "An error occured with the database",
            fr_error: "Un problème est survenu avec la base de donnée",
          });
        else if (result) {
          if (data.params.state) {
            Movies.updateOne(
              {
                id: data.params.movieId,
                hash: data.params.hash,
              },
              {
                $set: {
                  lastSeen: new Date(),
                  state: data.params.state,
                },
              },
              (err, result) => {
                if (err)
                  reject({
                    res: data.res,
                    en_error: "An error occured with the database",
                    fr_error: "Un problème est survenu avec la base de donnée",
                  });
                else resolve(data);
              }
            );
          } else {
            Movies.updateOne(
              {
                id: data.params.movieId,
                hash: data.params.hash,
              },
              {
                $set: {
                  lastSeen: new Date(),
                },
              },
              (err, result) => {
                if (err)
                  reject({
                    res: data.res,
                    en_error: "An error occured with the database",
                    fr_error: "Un problème est survenu avec la base de donnée",
                  });
                else resolve(data);
              }
            );
          }
        } else {
          console.log("wesh la team");
          const movies = new Movies({
            id: data.params.movieId,
            userId: data.params.userId,
            hash: data.params.hash,
            lastSeen: new Date(),
            fullPath: data.params.fileInfo.fullPath,
            partialPath: data.params.fileInfo.partialPath,
            folder: data.params.fileInfo.folder,
            file: data.params.fileInfo.file,
            state: data.params.state,
            size: data.params.size,
            quality: data.params.quality,
          });
          movies.save((err, result) => {
            if (err)
              reject({
                res: data.res,
                en_error: "An error occured with the database",
                fr_error: "Un problème est survenu avec la base de donnée",
              });
            else resolve(data);
          });
        }
      }
    );
  });
};

module.exports.getInfos = (data) => {
  return new Promise((resolve, reject) => {
    Movies.findOne({ hash: data.params.hash }, (err, result) => {
      if (err)
        reject({
          res: data.res,
          en_error: "An error occured with the database",
          fr_error: "Un problème est survenu avec la base de donnée",
        });
      else if (result) {
        data.params.info = result;
        resolve(data);
      } else
        reject({
          res: data.res,
          en_error: "This hash doesn't match any torrent, sorry",
          fr_error: "Ce magnet ne correspond à aucun torrent, désolé",
        });
    });
  });
};

module.exports.convert = (data) => {
  return new Promise((resolve, reject) => {
    if (data.params.quality === "x264" || data.params.quality === "XviD")
      data.params.quality = "480p";
    if (data.params.quality.search("BD") >= 0) data.params.quality = "1080p";
    if (
      data.params.quality === "240p" ||
      data.params.quality === "360p" ||
      data.params.quality === "480p" ||
      data.params.quality === "720p" ||
      data.params.quality === "1080p"
    ) {
      options = [
        {
          "240p": {
            size: "426x240",
            bitrate_video: "365k",
            bitrate_audio: "128k",
          },
        },
        {
          "360p": {
            size: "640x360",
            bitrate_video: "730k",
            bitrate_audio: "196k",
          },
        },
        {
          "480p": {
            size: "854x480",
            bitrate_video: "2000k",
            bitrate_audio: "196k",
          },
        },
        {
          "720p": {
            size: "1280x720",
            bitrate_video: "3000k",
            bitrate_audio: "196k",
          },
        },
        {
          "1080p": {
            size: "1920x1080",
            bitrate_video: "4500k",
            bitrate_audio: "196k",
          },
        },
      ];
      let settings = options.find((setting) => {
        return setting[data.params.quality];
      })[data.params.quality.toString()];
      let convert = FFmpeg(
        `http://localhost:8080/api/movie/stream/${data.params.hash}?token=${data.token}`
      )
        .format("webm")
        .size(settings.size)
        .videoCodec("libvpx")
        .videoBitrate(settings.bitrate_video)
        .audioCodec("libopus")
        .audioBitrate(settings.bitrate_audio)
        .outputOptions(["-quality realtime"])
        .audioChannels(2)
        .on("error", (err) => {
          convert.kill();
          if (err !== "Output stream closed")
            reject({ err: data.res, en_error: err });
        });
      convert.pipe(data.res);
      resolve(data);
    } else
      reject({
        res: data.res,
        en_error: "This quality isn't available",
        fr_error: "Cette qualité n'est pas disponible",
      });
  });
};

module.exports.stream = (data) => {
  return new Promise((resolve, reject) => {
    if (data.params.info.state === "over") {
      let path = data.params.info.fullPath;
      fs.stat(path, (err, stats) => {
        if (err) reject({ res: data.res, error: "Unavailable path" });
        else {
          let fileSize = stats.size;
          if (data.params.range) {
            let parts = data.params.range.replace(/bytes=/, "").split("-");
            let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            let start =
              parseInt(parts[0], 10) < end ? parseInt(parts[0], 10) : 0;
            let chunksize = end - start + 1;
            let file = fs.createReadStream(path, { start, end });
            let headers = {
              "Content-Range": `bytes ${start}-${end}/${fileSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": chunksize,
              "Content-Type": "video/webm",
            };
            data.res.writeHead(206, headers);
            file.pipe(data.res);
          } else {
            let file = fs.createReadStream(path);
            let headers = {
              "Content-Length": fileSize,
              "Content-Type": "video/webm",
            };
            data.res.writeHead(200, headers);
            file.pipe(data.res);
          }
          resolve(data);
        }
      });
    } else {
      let path = torrent_engine.find(
        (torrent) => torrent.hash === data.params.hash
      ).file;
      let fileSize = path.length;
      if (data.params.range) {
        let parts = data.params.range.replace(/bytes=/, "").split("-");
        let start = parseInt(parts[0], 10);
        let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        let chunksize = end - start + 1;
        let file = path.createReadStream({ start, end });
        let headers = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/webm",
        };
        data.res.writeHead(206, headers);
        file.pipe(data.res);
      } else {
        let file = path.createReadStream();
        let headers = {
          "Content-Length": fileSize,
          "Content-Type": "video/webm",
        };
        data.res.writeHead(200, headers);
        file.pipe(data.res);
      }
      resolve(data);
    }
  });
};

module.exports.downloadTorrent = (data) => {
  return new Promise((resolve, reject) => {
    console.log("test", data.params.hash, data.params.movieId);
    const path = `../movies/${data.params.movieId}`;
    const options = {
      path,
      tracker: true,
      trackers,
      uploads: 10,
      verify: true,
    };
    let engine = torrentStream(
      `magnet:?xt=urn:btih:${data.params.hash}`,
      options
    );
    let started = false;
    engine.on("ready", () => {
      let index = engine.files.indexOf(
        engine.files.reduce((a, b) => (a.length > b.length ? a : b))
      );
      engine.files.forEach((file, ind) => {
        if (ind === index) {
          file.select();
          console.info(`Chosen file: ${file.name}`);
        } else file.deselect();
      });
      data.params.file = engine.files[index];
      data.params.fileInfo = {
        fullPath: `${engine.path}/${data.params.file.path}`,
        partialPath: `${engine.path}/${engine.torrent.name}`,
        folder: engine.torrent.name,
        file: data.params.file.name,
      };
      data.params.state = "waiting";
      torrent_engine.push({
        hash: data.params.hash,
        file: data.params.file,
        engine: engine,
      });
      resolve(data);
    });
    engine.on("download", (piece) => {
      started = true;
      if (started) {
        data.params.state = "downloading";
        try {
          this.saveTorrent(data);
        } catch (err) {
          reject({
            res: data.res,
            en_error: "An error occured with the database",
            fr_error: "Un problème est survenu avec la base de donnée",
          });
        }
      }
    });
    engine.on("idle", (fn) => {
      data.params.state = "over";
      try {
        this.saveTorrent(data);
        let ind = torrent_engine.findIndex((engine) => {
          return engine.hash === data.params.torrent.hash;
        });
        torrent_engine.splice(ind, 1);
      } catch (err) {
        reject({
          res: data.res,
          en_error: "An error occured with the database",
          fr_error: "Un problème est survenu avec la base de donnée",
        });
      }
    });
  });
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
  ret = true;
  console.log(`downloading ${lang} subtitle...`);

  const download = await got.stream(link);
  download.on("error", (error) => {
    ret = false;
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
  return ret;
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
      if ((await DlSubs(links.English, "en", imdb_id)) === true)
        subs.push({
          lang: "english",
          langShort: "en",
          path: `../movies/${imdb_id}/subs/en/${imdb_id}.vtt`,
          fileName: `${imdb_id}.vtt`,
        });
    }
    if (links.French) {
      if ((await DlSubs(links.French, "fr", imdb_id)) === true)
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

exports.getSubtitleFile = async (req, res) => {
  var path = `/${req.params.imdb_id}/subs/${req.params.lang}/${req.params.imdb_id}.vtt`;
  console.log(path);
  const filesExist = fs.existsSync(config.movie_folder + path);
  if (filesExist) {
    res.sendFile(config.movie_folder + path, function (err) {
      if (err) {
        console.log(err);
        res.status(err.status).end();
      } else {
        console.log("Sent:", config.movie_folder + path);
      }
    });
  } else {
    console.log("error", filesExist);
    res.send(null);
  }
};
