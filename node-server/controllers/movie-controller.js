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
const { checkUserSeeMovie, getUser } = require("../models/lib-user.model");
var searchCancelTokenFetch = { id: null, source: null };

async function getYTSMovies(paramsYts, userId) {
  const source = axios.CancelToken.source();
  searchCancelTokenFetch.source = source;
  if (paramsYts?.search && !paramsYts?.sort) {
    paramsYts.sort = "title";
  }
  const data = await axios
    .get(YTS_LIST, {
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
    })
    .catch((err) => undefined);
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
          see = await checkUserSeeMovie(userId, m.imdb_code);
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
          see = await checkUserSeeMovie(userId, m.imdb_code);
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

async function getInfoMovies(userId, movies, lang) {
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

              const movie = await axios
                .get(
                  `https://api.themoviedb.org/3/movie/${m.imdb_code}?api_key=5b9a9289b9a6931460aa319b2b3a6d33`
                )
                .catch((err) => undefined);

              if (movie?.data.vote_average === 0 || !movie) {
                return undefined;
              }

              const movieTranslations = await axios
                .get(
                  `https://api.themoviedb.org/3/movie/${m.imdb_code}/translations?api_key=5b9a9289b9a6931460aa319b2b3a6d33`
                )
                .catch((err) => undefined);

              let titleTranslation = undefined;
              if (lang !== undefined) {
                titleTranslation = movieTranslations.data.translations.find(
                  (translation) => translation.iso_3166_1 === lang.toUpperCase()
                )?.data?.title;
              }
              return {
                imdb_code: m.imdb_code,
                title: titleTranslation ? titleTranslation : movie.data.title,
                year: m.year
                  ? m.year
                  : dateFns.getYear(new Date(movie.data.release_date)),
                rating: m.rating ? m.rating : movie.data.vote_average,
                poster:
                  movie.data.poster_path !== null
                    ? "https://image.tmdb.org/t/p/original" +
                      movie.data.poster_path
                    : undefined,
                seeds: m.seeds,
                runtime: movie.data.runtime + " min",
                see: m.see,
                fav: favorite,
              };
            }
          })
        )
      );
    } else resolve([]);
  });
}

exports.getListMovie = async (req, res) => {
  const page = parseInt(req.query.page);
  const note = parseInt(req.query.note);
  const userId = req.query.userId.trim();
  const genre = req.query.genre.trim();
  const sort = req.query.sort.trim();
  const search = req.query.search.trim();
  const order = req.query.order.trim();
  const year = req.query.year.split(",");

  const lang = req.query.lang.trim();

  const paramsYts = { page, genre, sort, note, search, order };
  YTSmovies = await getYTSMovies(paramsYts, userId);
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
    if (YTSmovies !== undefined) {
      YTSmovies = YTSmovies.filter(
        (object, index) =>
          index ===
          YTSmovies.findIndex(
            (obj) =>
              JSON.stringify(obj.imdb_code) === JSON.stringify(object.imdb_code)
          )
      );
      movies = await getInfoMovies(userId, YTSmovies, lang);
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
      RARBGmovies_filtred = await getInfoMovies(userId, RARBGmovies, lang);
      movies = movies.concat(RARBGmovies_filtred);
    }
    res.json({
      status: true,
      movies: movies.filter(
        (movie) =>
          movie &&
          movie.title &&
          movie.poster &&
          movie.year >= year[0] &&
          movie.year <= year[1]
      ),
    });
  } else {
    if (YTSmovies?.length === 0 || !YTSmovies) {
      res.json({
        status: true,
      });
    } else {
      movies_filtred = await getInfoMovies(userId, YTSmovies, lang);
      res.json({
        status: true,
        movies: movies_filtred.filter(
          (movie) =>
            movie &&
            movie.title &&
            movie.poster &&
            movie.poster !== "N/A" &&
            movie.year >= year[0] &&
            movie.year <= year[1]
        ),
      });
    }
  }
};

async function getHashYTS(imdb_code) {
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
          { id: imdb_code, hash: torrent.hash },
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

async function getHashRARBG(imdb_code) {
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
            { id: imdb_code, hash: hash[0] },
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
    .catch((err) => {});
  return movies;
}

async function getInfoMovie(imdb_code, lang, userId) {
  return new Promise(async (resolve, reject) => {
    let favorite = !!(await Fav.findOne({
      $query: { imdb_code: imdb_code, userId: userId },
    }).exec());

    const movie = await axios
      .get(
        `https://api.themoviedb.org/3/movie/${imdb_code}?api_key=5b9a9289b9a6931460aa319b2b3a6d33`
      )
      .catch((err) => undefined);

    if (movie?.data.vote_average === 0 || !movie) {
      resolve(undefined);
    }

    const credits = await axios
      .get(
        `https://api.themoviedb.org/3/movie/${imdb_code}/credits?api_key=5b9a9289b9a6931460aa319b2b3a6d33`
      )
      .catch((err) => undefined);

    const movieTranslations = await axios
      .get(
        `https://api.themoviedb.org/3/movie/${imdb_code}/translations?api_key=5b9a9289b9a6931460aa319b2b3a6d33`
      )
      .catch((err) => undefined);

    let movieTranslation = undefined;
    if (lang !== undefined) {
      movieTranslation = movieTranslations.data.translations.find(
        (translation) => translation.iso_3166_1 === lang.toUpperCase()
      );
    }
    let see = false;
    if (userId) {
      see = await checkUserSeeMovie(userId, imdb_code);
    }
    resolve({
      imdb_code: imdb_code,
      cast: credits?.data?.cast?.map((res) => res.name).join(", "),
      title: movieTranslation?.data?.title
        ? movieTranslation?.data?.title
        : movie.data.title,
      year: dateFns.getYear(new Date(movie.data.release_date)),
      rating: movie.data.vote_average,
      poster:
        movie.data.poster_path !== null
          ? "https://image.tmdb.org/t/p/original" + movie.data.poster_path
          : undefined,
      runtime: movie.data.runtime + " min",
      genre: movie.data.genres.map((genre) => genre.name).join(", "),
      resume: movieTranslation?.data?.overview
        ? movieTranslation?.data?.overview
        : movie.data.overview,
      rating: movie.data.vote_average,
      see: see,
      fav: favorite,
    });
  });
}

exports.getDetailMovie = async (req, res) => {
  const imdb_id = req.params.imdb_id;
  const userId = req.query.userId;
  const lang = req.query.lang;

  hashs = null;
  var hashs = await getHashRARBG(imdb_id);
  if (hashs) {
    hashs = hashs.concat(await getHashYTS(imdb_id));
  } else {
    hashs = await getHashYTS(imdb_id);
  }
  if (hashs)
    await hashs.sort(function (a, b) {
      if (a && b && b.seeds && a.seeds) return b.seeds - a.seeds;
      else return 0;
    });
  movieDetail = await getInfoMovie(imdb_id, lang, userId);
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
  const imdb_code = req.params.imdb_id;
  const userId = req.params.user_id;

  Fav.deleteOne({ imdb_code: imdb_code, userId: userId }).exec(
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

exports.getWatched = async (req, res) => {
  const userId = req.params.user_id;
  const lang = req.query.lang;

  const user = await getUser({ id: userId });
  if (user) {
    const results = await Promise.all(
      user.moviesWatched.map(async (movieId) => getInfoMovie(movieId, lang))
    );
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
};

exports.getFav = async (req, res) => {
  const userId = req.params.user_id;
  const lang = req.query.lang;

  const results = await Fav.find({ $query: { userId: userId } }).exec();

  if (results) {
    const resultsLang = await Promise.all(
      results.map(async (movie) => getInfoMovie(movie.imdb_code, lang, userId))
    );
    return res.json({
      status: true,
      movies: resultsLang,
    });
  } else {
    return res.json({
      status: true,
      movies: null,
    });
  }
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
        let date = Date.now(); // pour 1 mois en plus faire + 3000000000

        diff = dateFns.formatDistanceStrict(movie.lastSeenS, date, {
          unit: "month",
        });
        diff = diff.split(" ");
        if (diff[0] >= 1) {
          fs.rmdir(
            config.movie_folder + `/${movie.id}/${movie.folder}`,
            { recursive: true },
            (err) => {}
          );
          Movies.deleteOne({
            imdb_code: movie.imdb_code,
            hash: movie.hash,
          }).exec();
        }
      });
    } else {
      return res.json({
        status: true,
        movies: null,
      });
    }
  });
};
