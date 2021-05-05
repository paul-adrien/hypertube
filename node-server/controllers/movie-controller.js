const axios = require("axios");
const rarbgApi = require("rarbg-api");
const imdb = require("imdb-api");
const YTS_LIST = "https://yts.megaproxy.info/api/v2/list_movies.json";
const db = require("../models");
const { fav, user } = require("../models");
const config = require("../config/stream");
const Fav = db.fav;
const Movies = db.movies;
const dateFns = require("date-fns");
const fs = require("fs");
var searchCancelTokenFetch = { id: null, source: null };

async function getYTSMovies(userId, paramsYts) {
  const source = axios.CancelToken.source();
  searchCancelTokenFetch.source = source;
  const data = await axios.get(YTS_LIST, {
    params: {
      page: paramsYts?.page,
      genre: paramsYts?.genre,
      sort_by: paramsYts?.sort,
      minimum_rating: paramsYts?.note,
      query_term: paramsYts?.search,
      order_by: paramsYts?.order,
    },
    withCredentials: false,
    cancelToken: searchCancelTokenFetch.source.token,
  });
  movies = [];
  if (
    data &&
    data.data !== undefined &&
    data.data.data !== undefined &&
    data.data.data.movies !== undefined
  ) {
    movies = await Promise.all(
      data.data.data.movies.map(async (m) => {
        if (m && m.imdb_code && m.torrents) {
          see = await Movies.findOne({ id: m.imdb_code }, "state").exec();
          return {
            imdb_code: m.imdb_code,
            title: null,
            year: m.year,
            rating: m.rating,
            poster: null,
            runtime: m.runtime + " min",
            seeds: m.torrents[0].seeds,
            see: see ? true : false,
          };
        }
      })
    );
  }
  return movies;
}

async function getRarbgMovies(page, genre, sort, userId) {
  if (page >= 5) return null;
  if (sort === "seeds") sort = "seeders";
  let limit = 100;
  let options = {
    category: rarbgApi.CATEGORY.MOVIES,
    limit: limit,
    sort: "seeders",
  };
  movies = [];
  await rarbgApi.list(options).then(async (results) => {
    var see = false;
    movies = await Promise.all(
      results.map(async (m) => {
        if (m && m.episode_info && m.episode_info.imdb) {
          see = await Movies.findOne(
            { id: m.episode_info.imdb },
            "state"
          ).exec();
          return {
            imdb_code: m.episode_info.imdb,
            title: null,
            year: null,
            rating: null,
            poster: null,
            seeds: m.seeders,
            see: see ? true : false,
          };
        }
      })
    );
  });
  return movies;
}

async function getInfoMovies(userId, movies) {
  return new Promise(async (resolve, reject) => {
    i = 0;
    if (movies?.length > 0) {
      //console.log(movies);
      resolve(
        await Promise.all(
          movies.map(async (m) => {
            if (m && m.imdb_code) {
              let favorite = false;
              await Fav.findOne({
                $query: { imdb_code: m.imdb_code, userId: userId },
              }).exec((err, result) => {
                if (result) {
                  favorite = true;
                } else favorite = false;
              });
              return await imdb
                .get({ id: m.imdb_code }, { apiKey: "e8cb5cca" })
                .then((movie) => {
                  if (movie?.ratings.length === 0) {
                    return undefined;
                  }
                  return {
                    imdb_code: m.imdb_code,
                    title: movie.title,
                    year: m.year ? m.year : movie.year,
                    rating: m.rating ? m.rating : movie.rating,
                    poster: movie.poster,
                    seeds: m.seeds,
                    runtime: movie.runtime,
                    see: m.see,
                    fav: favorite,
                  };
                  //console.log(await movie?.rating);
                  //if (i + 1 == len) resolve(tmp);
                })
                .catch((err) => {
                  return undefined;
                });
            }
          })
        )
      );
    } else resolve([]);
  });
}

exports.getListMovie = async (req, res) => {
  const { userId, page, genre, sort, note, search, order } = req.body;
  const paramsYts = { page, genre, sort, note, search, order };
  console.log(paramsYts);
  YTSmovies = await getYTSMovies(userId, paramsYts);
  movies = [];
  if (
    page === 1 &&
    (genre === undefined || genre === "all") &&
    note === 0 &&
    search === "" &&
    sort === "download_count" &&
    order === ""
  ) {
    RARBGmovies = await getRarbgMovies(page, genre, sort, userId);
    console.log("test");
    if (YTSmovies !== undefined) {
      YTSmovies = YTSmovies.filter(
        (object, index) =>
          index ===
          YTSmovies.findIndex(
            (obj) =>
              JSON.stringify(obj.imdb_code) === JSON.stringify(object.imdb_code)
          )
      );
      movies = await getInfoMovies(userId, YTSmovies);
    }
    if (RARBGmovies !== undefined) {
      RARBGmovies = RARBGmovies.filter(
        (object, index) =>
          index ===
          RARBGmovies.findIndex(
            (obj) =>
              JSON.stringify(obj.imdb_code) === JSON.stringify(object.imdb_code)
          )
      );
      console.log("RARBG movies");
      RARBGmovies_filtred = await getInfoMovies(userId, RARBGmovies);
      movies = movies.concat(RARBGmovies_filtred);
    }
    res.json({
      status: true,
      movies: movies.filter((movie) => movie && movie.title && movie.poster),
    });
  } else {
    movies_filtred = await getInfoMovies(userId, YTSmovies);
    console.log("pppppp");
    res.json({
      status: true,
      movies: movies_filtred.filter(
        (movie) =>
          movie && movie.title && movie.poster && movie.poster !== "N/A"
      ),
    });
  }
};

async function getHashYTS(imdb_code, userId) {
  const source = axios.CancelToken.source();
  searchCancelTokenFetch.source = source;
  const data = await axios.get(YTS_LIST, {
    params: {
      query_term: imdb_code,
    },
    withCredentials: false,
    cancelToken: searchCancelTokenFetch.source.token,
  });
  if (data && data.data && data.data.data && data.data.data.movies) {
    movies = [];
    movies = await Promise.all(
      data.data.data.movies[0].torrents.map(async (torrent) => {
        state = await Movies.findOne(
          { id: imdb_code, hash: torrent.hash, userId: userId },
          "state"
        ).exec();
        if (
          torrent.quality === "1080p" ||
          torrent.quality === "480p" ||
          torrent.quality === "240p" ||
          torrent.quality === "360p" ||
          torrent.quality === "720p" ||
          torrent.quality === "XviD" ||
          torrent.quality === "BDRip"
        )
          return {
            imdb_code: imdb_code,
            seeds: torrent.seeds,
            peers: torrent.peers,
            hash: torrent.hash,
            quality: torrent.quality,
            size: torrent.size_bytes,
            source: "YTS",
            state: state ? state.state : false,
          };
      })
    );
    return movies;
  } else return null;
}

async function getHashRARBG(imdb_code, userId) {
  movies = [];
  await rarbgApi
    .search(imdb_code, null, "imdb")
    .then(async (results) => {
      const isQuality = (element) =>
        element === "1080p" ||
        element === "480p" ||
        element === "240p" ||
        element === "360p" ||
        element === "720p" ||
        element === "XviD" ||
        element === "BDRip";
      movies = await Promise.all(
        results.map(async (torrent) => {
          let title = torrent.title.split(".");
          let qualityId = title.findIndex(isQuality);
          let magnet = torrent.download.split(":");
          let hash = magnet[3].split("&dn=");
          let state = await Movies.findOne(
            { id: imdb_code, hash: hash[0], userId: userId },
            "state"
          ).exec();
          if (qualityId !== -1 && title[qualityId] !== undefined)
            return {
              imdb_code: imdb_code,
              seeds: torrent.seeders,
              peers: torrent.leechers,
              hash: hash[0],
              quality: title[qualityId],
              size: torrent.size,
              source: "RARBG",
              state: state ? state.state : false,
            };
        })
      );
    })
    .catch((err) => {
      console.log(err);
    });
  return movies;
}

async function getInfoMovie(imdb_code) {
  return new Promise(async (resolve, reject) => {
    resolve(
      await imdb
        .get({ id: imdb_code }, { apiKey: "e8cb5cca" })
        .then(async (movie) => {
          return {
            imdb_code: imdb_code,
            title: movie.title,
            year: movie.year,
            rating: movie.rating,
            poster: movie.poster,
            genre: movie.genres,
            director: movie.director,
            author: movie.writer,
            actors: movie.actors,
            resume: movie.plot,
            award: movie.award,
            metascore: movie.metascore,
            boxoffice: movie.boxoffice,
            production: movie.production,
            runtime: movie.runtime,
          };
        })
        .catch((err) => {
          //console.log(err);
          return null;
        })
    );
  });
}

exports.getDetailMovie = async (req, res) => {
  const imdb_id = req.params.imdb_id;
  const userId = req.query.userId;
  hashs = null;
  var hashs = await getHashRARBG(imdb_id, userId);
  if (hashs) {
    hashs = hashs.concat(await getHashYTS(imdb_id, userId));
  } else {
    hashs = await getHashYTS(imdb_id, userId);
  }
  hashs.sort(function (a, b) {
    return b.seeds - a.seeds;
  });
  movieDetail = await getInfoMovie(imdb_id);
  res.json({
    status: true,
    hashs: hashs,
    movieDetail: movieDetail,
  });
};

exports.addToFav = async (req, res) => {
  const movie = req.body.movie;
  const userId = req.body.userId;

  Fav.findOne({ $query: { imdb_code: movie.imdb_code, userId: userId } }).exec(
    (err, result) => {
      if (err) {
        return res.json({
          status: false,
          message: err,
        });
      } else if (result) {
        console.log(result);
        return res.json({
          status: false,
          message: "this film is already fav",
        });
      } else {
        const fav = new Fav({
          imdb_code: movie.imdb_code,
          title: movie.title,
          year: movie.year,
          rating: movie.rating,
          poster: movie.poster,
          seeds: movie.seeds,
          runtime: movie.runtime,
          see: movie.see,
          userId: userId,
        });

        fav.save((err, result) => {
          if (err) {
            return res.json({
              status: false,
              message: err,
            });
          }
          res.send({
            message: "Movie was registered successfully to favorite!",
          });
        });
      }
    }
  );
};

exports.deleteFav = async (req, res) => {
  const movie = req.body.movie;
  const userId = req.body.userId;

  Fav.deleteOne({ imdb_code: movie.imdb_code, userId: userId }).exec(
    (err, result) => {
      if (err) {
        return res.json({
          status: false,
          message: err,
        });
      } else {
        res.send({ message: "Movie was delete to favorite!" });
      }
    }
  );
};

exports.getFav = async (req, res) => {
  const userId = req.params.userId;

  Fav.find({ $query: { userId: userId } }).exec((err, results) => {
    if (err) {
      return res.json({
        status: false,
        message: err,
      });
    } else if (results) {
      console.log(results);
      return res.json({
        status: true,
        movies: results,
      });
    } else {
      return res.json({
        status: true,
        movies: null,
      });
    }
  });
};

exports.dellMovies = async (req, res) => {
  Movies.find().exec((err, results) => {
    if (err) {
      return res.json({
        status: false,
        message: err,
      });
    } else if (results) {
      results.map((movie) => {
        let date = 1622791471961; // pour 1 mois en plus faire + 3000000000

        diff = dateFns.formatDistanceStrict(movie.lastSeenS, date, {
          unit: "month",
        });
        diff = diff.split(" ");
        //console.log(diff[0]);
        if (diff[0] >= 1) {
          fs.rmdir(`../movies/${movie.id}`, { recursive: true }, (err) => {
            console.log("Folder Deleted!" + err);
          });
        }
        Movies.deleteOne({
          imdb_code: movie.imdb_code,
          hash: movie.hash,
        }).exec();
      });
    } else {
      return res.json({
        status: true,
        movies: null,
      });
    }
  });
};
