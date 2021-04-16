const axios = require("axios");
const rarbgApi = require('rarbg-api');
const imdb = require('imdb-api');
const YTS_LIST = "https://yts.megaproxy.info/api/v2/list_movies.json";
var searchCancelTokenFetch = { id: null, source: null };

async function getYTSMovies(page, genre, sort) {
  const source = axios.CancelToken.source();
  searchCancelTokenFetch.source = source;
  const data = await axios.get(YTS_LIST, {
    params: {
      page: page,
      genre: "all",
      sort_by: sort,
      order_by: 'desc'
    },
    withCredentials: false,
    cancelToken: searchCancelTokenFetch.source.token,
  });
  movies = [];
  if (data) {
    i = 0;
    data.data.data.movies.map((m) => {
      if (m && m.imdb_code && m.torrents)
        movies[i++] = {
          imdb_code: m.imdb_code,
          title: null,
          year: null,
          rating: null,
          poster: null,
          seeds: m.torrents[0].seeds
        };
    });
  }
  return movies;
}

async function getRarbgMovies(page, genre, sort) {
  if (page >= 5) return null;
  if (sort === 'seeds') sort = 'seeders';
  let limit = 100;
  let options = { category: rarbgApi.CATEGORY.MOVIES, limit: limit, sort: "seeders" }
  movies = [];
  await rarbgApi.list(options)
    .then(results => {
      i = 0;
      results.map((m) => {
        if (m && m.episode_info && m.episode_info.imdb)
          movies[i++] = {
            imdb_code: m.episode_info.imdb,
            title: null,
            year: null,
            rating: null,
            poster: null,
            seeds: m.seeders
          };
      })
    })
    .catch(err => {
      console.log(err)
      return null;
    })
  return movies;
}

async function getInfoMovies(movies) {
  return new Promise(async (resolve, reject) => {
    i = 0;
    tmp = movies.slice();
    len = tmp.length;
    Object.freeze(movies);
    await tmp.forEach(async m => {
      if (m && m.imdb_code) {
        await imdb.get({ id: m.imdb_code }, { apiKey: 'e8cb5cca' }).then(async movie => {
          tmp[await movies.findIndex(j => j.imdb_code === m.imdb_code)] = {
            imdb_code: m.imdb_code,
            title: movie.title,
            year: movie.year,
            rating: movie.rating,
            poster: movie.poster,
            seeds: m.seeds
          };
          if ((i + 1) == len)
            resolve(tmp);
        })
          .catch(err => {
            //console.log(err);
            i++;
          })
      }
      i++;
    })
  });
}

exports.getListMovie = async (req, res) => {
  const { page, genre, sort } = req.body;
  console.log(page, genre, sort);
  YTSmovies = await getYTSMovies(page, genre, sort);
  movies = []
  if (page == 1) {
    RARBGmovies = await getRarbgMovies(page, genre, sort);
    if (YTSmovies !== undefined) {
      YTSmovies = YTSmovies.filter((object, index) => index === YTSmovies.findIndex(obj => JSON.stringify(obj.imdb_code) === JSON.stringify(object.imdb_code)));
      movies = await getInfoMovies(YTSmovies);
    };
    if (RARBGmovies !== undefined) {
      RARBGmovies = RARBGmovies.filter((object, index) => index === RARBGmovies.findIndex(obj => JSON.stringify(obj.imdb_code) === JSON.stringify(object.imdb_code)));
      RARBGmovies_filtred = await getInfoMovies(RARBGmovies);
      movies = movies.concat(RARBGmovies_filtred);
    };
    res.json({
      status: true,
      movies: movies
    })
  } else {
    movies_filtred = await getInfoMovies(YTSmovies);
    res.json({
      status: true,
      movies: movies_filtred
    })
  }
};

async function getHashYTS(imdb_code) {
  const source = axios.CancelToken.source();
  searchCancelTokenFetch.source = source;
  const data = await axios.get(YTS_LIST, {
    params: {
      query_term: imdb_code
    },
    withCredentials: false,
    cancelToken: searchCancelTokenFetch.source.token,
  });
  if (data && data.data && data.data.data && data.data.data.movies) {
    movies = [];
    i = 0;
    data.data.data.movies[0].torrents.map((torrent) => {
      movies[i++] = {
        imdb_code: imdb_code,
        seeds: torrent.seeds,
        peers: torrent.peers,
        hash: torrent.hash,
        quality: torrent.quality,
        source: "YTS"
      };
    })
    return movies;
  } else
    return null;
}

async function getHashRARBG(imdb_code) {
  movies = [];
  await rarbgApi.search(imdb_code, null, 'imdb')
    .then(results => {
      const isQuality = (element) => element === '1080p' || element === '720p' || element === '2160p' || element === '3D' || element === 'XviD' || element === 'BDRip';
      i = 0;
      results.map((torrent) => {
        var title = torrent.title.split('.');
        qualityId = title.findIndex(isQuality);
        console.log(title[qualityId]);
        var magnet = torrent.download.split(':');
        var hash = magnet[3].split('&dn=');
        console.log(hash[0]);
        movies[i++] = {
          imdb_code: imdb_code,
          seeds: torrent.seeders,
          peers: torrent.leechers,
          hash: hash[0],
          quality: title[qualityId],
          source: "RARBG"
        };
      });
    })
    .catch(err => {
      console.log(err)
    })
  return movies;
}

async function getInfoMovie(imdb_code) {
  return new Promise(async (resolve, reject) => {
    resolve(await imdb.get({ id: imdb_code }, { apiKey: 'e8cb5cca' }).then(async movie => {
      return {
        imdb_code: imdb_code,
        title: movie.title,
        year: movie.year,
        rating: movie.rating,
        poster: movie.poster,
        genre: movie.genre,
        director: movie.director,
        author: movie.writer,
        actors: movie.actors,
        resume: movie.plot,
        award: movie.award,
        metascore: movie.metascore,
        boxoffice: movie.boxoffice,
        production: movie.production
      }
    })
      .catch(err => {
        //console.log(err);
        return null;
      }))
  })
}

exports.getDetailMovie = async (req, res) => {
  const imdb_id = req.params.imdb_id;
  hashs = null;
  var hashs = await getHashRARBG(imdb_id);
  if (hashs) {
    hashs = hashs.concat(await getHashYTS(imdb_id));
  } else {
    hashs = await getHashYTS(imdb_id);
  }
  hashs.sort(function (a, b) { return b.seeds - a.seeds });
  movieDetail = await getInfoMovie(imdb_id);
  res.json({
    status: true,
    hashs: hashs,
    movieDetail: movieDetail
  })
};