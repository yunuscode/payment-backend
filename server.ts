import "dotenv/config.js";

import * as express from "express";
const app = express();

import logger from "@helpers/logger";
import indexRoute from "@routes/index";

const PORT = process.env.PORT;

app.use(express.json());

app.listen(PORT, () => logger("SERVER", "App started at", PORT));

app.use("/", indexRoute);
