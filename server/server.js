import fs from "fs";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = import.meta.env.VITE_APP_SERVER_PORT || 64064;

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
import JiraUtility from "./modules/JiraUtility.js";
JiraUtility(app);

try {
  app.listen(port, () => {
    console.log(`OAuth redirect server running at http://localhost:${port}`);
  });
} catch (err) {
  console.log(err);
}
