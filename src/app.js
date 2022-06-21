require("dotenv").config();

const express = require("express");
const cors = require("cors");
const auth = require("./auth");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.options("/api*", cors());
app.use("/api/*", auth());

//----------------------------------------------------------------------------------------------------------------------

const ENDPOINT = "./endpoints/";

app.get("/", (_req, res) => {
  res.status(200).send("DevOpsMetrics Api is Running");
});
app.use(require(ENDPOINT + "swagger"));

app.use("/api", require(ENDPOINT + "events"));
app.use("/api", require(ENDPOINT + "metrics"));
app.use("/api", require(ENDPOINT + "githubHook"));
app.use("/api", require(ENDPOINT + "lastDeploy"));

module.exports = app;
