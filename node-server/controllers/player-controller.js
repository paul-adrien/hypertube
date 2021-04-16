const torrentStream = require("torrent-stream");
const ffmpeg = require("fluent-ffmpeg");
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

function convertStream(file, start, end) {
  try {
    const convertedFile = new FFmpeg(
      file.createReadStream({
        start,
        end,
      })
    )
      .videoCodec("libvpx")
      .audioCodec("libvorbis")
      .format("webm")
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
    const { hash } = req.query;
    const { imdb_id } = req.params;
    const magnet = `magnet:?xt=urn:btih:${hash}`;
    const path = `../movies/${imdb_id}`;
    const options = {
      path,
      tracker: true,
      trackers,
      uploads: 10,
      connection: 3000
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
            "Content-Type": `video/${file_type}`,
          },
          start,
          end,
        };
        console.log(ContentHeader);
        res.writeHead(206, ContentHeader.Header);
        let movieStream;
        if (wrongType)
          movieStream = convertStream(
            movie.engine,
            ContentHeader.start,
            ContentHeader.end
          );
        else
          movieStream = movie.engine.createReadStream({
            start: ContentHeader.start,
            end: ContentHeader.end,
          });
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
