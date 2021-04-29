const mongoose = require("mongoose");

const Fav = mongoose.model(
    "Fav",
    new mongoose.Schema({
        imdb_code: String,
        title: String,
        year: Number,
        rating: String,
        poster: String,
        seeds: Number,
        runtime: String,
        see: Boolean,
        userId: String
    })
);

module.exports = Fav;