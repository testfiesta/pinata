const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.VUE_APP_SERVER_PORT || 64064;

const corsOptions = {
  origin: `http://localhost:${port}`,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// path
app.use(express.static(path.join(__dirname, "images")));

app.disable("x-powered-by");

// modules
require("./modules/JiraUtility")(app);

try {
  app.listen(port, () => {
    console.log(`OAuth redirect server running at http://localhost:${port}`);
  });
} catch (err) {
  console.log(err);
}
