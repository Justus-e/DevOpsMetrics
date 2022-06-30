const axios = require("axios");
const influx = require("./influx");

const GITHUB_URL = process.env.GITHUB_URL || "https://api.github.com";

const getLastDeploy = async () => {
  const result = await influx.queryLastDeployEvent();
  if (result.length === 1) {
    return {
      id: result[0]._value,
      timestamp: result[0]._time,
    };
  }
};

const getApiCommits = async (payload) => {
  const lastDeploy = await getLastDeploy();
  if (!!lastDeploy) {
    console.log("last deploy: ", lastDeploy);
    return axios.get(
      `${GITHUB_URL}/repos/${payload.repository.full_name}/commits?since=${lastDeploy.timestamp}`,
      {
        headers: { "User-Agent": payload.sender.login },
        auth:
          process.env.GITHUB_USER && process.env.GITHUB_OAUTH
            ? {
                username: process.env.GITHUB_USER,
                password: process.env.GITHUB_OAUTH,
              }
            : undefined,
      }
    );
  } else {
    console.log("no last deploy found");
    return axios.get(
      `${GITHUB_URL}/repos/${payload.repository.full_name}/commits`,
      {
        headers: { "User-Agent": payload.sender.login },
        auth:
          process.env.GITHUB_USER && process.env.GITHUB_OAUTH
            ? {
                username: process.env.GITHUB_USER,
                password: process.env.GITHUB_OAUTH,
              }
            : undefined,
      }
    );
  }
};

const createWebhook = (repoName, appHostUrl) => {
  //todo: finish
  return axios.post(`${GITHUB_URL}/repos/${repoName}/hooks`, {
    headers: { Accept: "application/vnd.github.v3+json" },
    auth: {
      username: process.env.GITHUB_USER,
      password: process.env.GITHUB_OAUTH,
    },
    body: {
      name: "DevOpsMetrics",
      active: true,
      events: ["push", "issues", "deployment_status"],
    },
    config: {
      url: `${appHostUrl}/api/github-hook/`,
      content_type: "json",
      //secret: `${process.env.API_KEY}`,
      insecure_ssl: 0,
    },
  });
};

module.exports = { getApiCommits };
