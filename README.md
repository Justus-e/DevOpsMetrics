[![CodeFactor](https://www.codefactor.io/repository/github/justus-e/devopsmetrics/badge)](https://www.codefactor.io/repository/github/justus-e/devopsmetrics)
[![Test](https://github.com/Justus-e/DevOpsMetrics/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/Justus-e/DevOpsMetrics/actions/workflows/test.yml)
# DevOpsMetrics

A tool to measure software delivery performance by calculating the four DORA Metrics

## Local Dev

Run locally: `npm run dev`

Api Docs: `http://<your_host>/swagger`

## Environment Variables

| var               | description                                                                                                   | example                      |
|:------------------|:--------------------------------------------------------------------------------------------------------------|:-----------------------------|
| **PORT**          | _optional_ - Port on which the API should be listening (default: 8080)                                        | 8080                         |
| **API_KEY**       | _required_ - Authorization Key for this Api required to access all Endpoints                                  | 'SoMeRand0MS3curE5trinG'     |
| **INFLUX_URL**    | _required_ - URL of the InfluxDB instance that should be used                                                 | 'http://localhost:8086'      |
| **INFLUX_TOKEN**  | _required_ - Token to access InfluxDB (can be generated in the InfluxDB UI)                                   | 'AmfWLq5PbC_89NkpO\[...]'    |
| **INFLUX_ORG**    | _required_ - Organization name of the InfluxDB instance                                                       | 'DevOpsMetrics'              |
| **INFLUX_BUCKET** | _required_ - Name of the InfluxDB bucket where the events should be stored                                    | 'events'                     |
| **GITHUB_URL**    | _optional_ - GitHub URL of GitHub Server where the tracked Repo is stored (default: 'https://api.github.com') | 'https://api.github.com'     |
| **GITHUB_USER**   | _optional_ - Needed if Repository is private or on an Enterprise Server                                       | 'justus-e'                   |
| **GITHUB_OAUTH**  | _optional_ - Needed if Repository is private or on an Enterprise Server (can be generated in the GitHub UI)   | 'ghp_bitz8n81coxxnYvZ\[...]' |

## Setup on GitHub
### Create Personal access token

_optional if the Repository is public and on the regular GitHub server_

1. Go to your account `settings > Developer settings > Personal acess tokens > Generate new token`
2. Expiration should be `no expiration` or a new token has to be created regularly
3. `repo` scope should be selected
~~4. _optional_ - `admin:repo_hook` can be selected to automate next step "Create Webhook"~~

### Create Webhook

1. Go to the page of the repository that should be tracked
2. Go to `Settings > Webhooks > Add webhook`
3. For Payload URL paste: `https://<your_host>/api/github-hook/`
4. For content type select `application/json`
5. For Secret paste your `API_KEY` that you set in your ENV-Vars
6. Select `Let me select individual events`
7. Check `Deployment statuses`, `Issues` and `Pushes`
