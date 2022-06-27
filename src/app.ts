import * as express from "express";
import * as cors from "cors";
import auth from "./auth";
import events from "./endpoints/events";
import metrics from "./endpoints/metrics";
import githubHook from "./endpoints/githubHook";
import lastDeploy from "./endpoints/lastDeploy";
import swagger from "./endpoints/swagger";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.options("/api*", cors());
app.use("/api/*", auth());

//----------------------------------------------------------------------------------------------------------------------

app.get("/", (_req, res) => {
  res.status(200).send("DevOpsMetrics Api is Running");
});
app.use(swagger);

app.use("/api", events);
app.use("/api", metrics);
app.use("/api", githubHook);
app.use("/api", lastDeploy);

export default app;
