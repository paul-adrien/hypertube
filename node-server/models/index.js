const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./users.model");
db.comment = require("./comments.model");

module.exports = db;