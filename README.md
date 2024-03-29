[![CodeFactor](https://www.codefactor.io/repository/github/justus-e/devopsmetrics/badge)](https://www.codefactor.io/repository/github/justus-e/devopsmetrics)
[![Test](https://github.com/Justus-e/DevOpsMetrics/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/Justus-e/DevOpsMetrics/actions/workflows/test.yml)
# DevOpsMetrics

![](LOGO.png)

A tool to measure software delivery performance by calculating the four DORA Metrics

## Install on kubernetes

1. fill missing values in values.yaml
2. run `helm upgrade --install devopsmetrics ./deployment/devopsmetrics/ --values ./deployment/devopsmetrics/values.yaml`

chart includes influxDB instance + grafana dashboard

### configuration

In default Configuration the API will be exposed: `<host>:30303/api`

Swagger Documentation: `<host>:30303/swagger`

Grafana instance: `<host>:30304`

#### import grafana dashboard

1. Open Grafana UI `<host>:30304`
2. Login with `admin` as username and password
3. change credentials if needed
4. select Create (+) > import
5. put id `16645` in the "import from grafana.com" field OR import via JSON
6. click load
7. as datasource select "InfluxDB"

You should now see the Dashboard without data.

## Setup on GitHub
### Create Personal access token

_optional if the Repository is public and on the regular GitHub server_

1. Go to your account `settings > Developer settings > Personal acess tokens > Generate new token`
2. Expiration should be `no expiration` or a new token has to be created regularly
3. `repo` scope should be selected

### Create Webhook

1. Go to the page of the repository that should be tracked
2. Go to `Settings > Webhooks > Add webhook`
3. For Payload URL paste: `https://<your_host>/api/github-hook/`
4. For content type select `application/json`
5. For Secret paste your `API_KEY` that you set in your ENV-Vars
6. Select `Let me select individual events`
7. Check `Deployment statuses`, `Issues` and `Pushes`


## Start Container

Build: `docker build . -t justusernst/devopsmetrics`

Run: `docker run --name devopsmetrics --env-file <your_env_file> -p <PORT>:8080 -d justus-e/devopsmetrics`


## Environment Variables

| var               | description                                                                                                                         | example                      |
|:------------------|:------------------------------------------------------------------------------------------------------------------------------------|:-----------------------------|
| **PORT**          | _optional_ - Port on which the API should be listening (default: 8080)                                                              | 8080                         |
| **API_KEY**       | _required_ - Authorization Key for this Api required to access all Endpoints                                                        | 'SoMeRand0MS3curE5trinG'     |
| **INFLUX_URL**    | _required_ - URL of the InfluxDB instance that should be used                                                                       | 'http://localhost:8086'      |
| **INFLUX_TOKEN**  | _required_ - Token to access InfluxDB (can be generated in the InfluxDB UI)                                                         | 'AmfWLq5PbC_89NkpO\[...]'    |
| **INFLUX_ORG**    | _required_ - Organization name of the InfluxDB instance                                                                             | 'DevOpsMetrics'              |
| **INFLUX_BUCKET** | _required_ - Name of the InfluxDB bucket where the events should be stored                                                          | 'events'                     |
| **GITHUB_URL**    | _optional_ - GitHub URL of GitHub Server where the tracked Repo is stored (default: 'https://api.github.com')                       | 'https://api.github.com'     |
| **GITHUB_USER**   | _optional_ - Needed if Repository is private or on an Enterprise Server                                                             | 'justus-e'                   |
| **GITHUB_OAUTH**  | _optional_ - Needed if Repository is private or on an Enterprise Server (can be generated in the GitHub UI)                         | 'ghp_bitz8n81coxxnYvZ\[...]' |
| **TEST_MODE**     | _optional_ - If set to `true`, the app will start in Test mode, operating on a separate randomly generated Dataset (default: false) | true                         |

## Local Dev

Run locally: `npm run dev`

Api Docs: `http://<your_host>/swagger`

## Links

Docker Image: [https://hub.docker.com/r/justusernst/devopsmetrics]()

Grafana Dashboard: [https://grafana.com/grafana/dashboards/16645]()
