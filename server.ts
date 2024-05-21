require("dotenv").config();
const express = require("express");
const app = express();

const logger = require("./helpers/logger");

const PORT = process.env.PORT;

app.listen(PORT, () => logger("SERVER", "App started at", PORT));
