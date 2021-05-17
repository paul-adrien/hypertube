const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbConfig = require("./config/db");
const db = require("./models");
const passport = require("passport");

const swaggerUi = require('swagger-ui-express');
const openApiDocumentation = require('./openApiDocumentation');

let torrent_engine = []

global.torrent_engine = torrent_engine

const app = express();

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

app.use(express.json());

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    //console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to plaurent application." });
});

var movieController = require("./controllers/movie-controller");
setInterval(movieController.dellMovies, 3600000);

app.use('/explorer', swaggerUi.serve, swaggerUi.setup(openApiDocumentation));

// routes
require("./routes/auth-routes")(app);
require("./routes/user-routes")(app);
require("./routes/Oauth-routes")(app);
require("./routes/comments-routes")(app);
const routes = require('./routes/movie-routes');
app.use(routes);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  //console.log(`Server is running on port ${PORT}.`);
});
