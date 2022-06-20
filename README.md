# DevOpsMetrics

A tool to measure software delivery performance by calculating the four DORA Metrics

## Local Dev

Run locally: `npm run dev`

Api Docs: `http://<your_host>/swagger`

## Environment Variables

| var               | description                                                                                                   | example                   |
|:------------------|:--------------------------------------------------------------------------------------------------------------|:--------------------------|
| **PORT**          | _optional_ - Port on which the API should be listening (default: 8080)                                        | 8080                      |
| **API_KEY**       | _required_ - Authorization Key for this Api required to access all Endpoints                                  | 'SoMeRand0MS3curE5trinG'  |
| **INFLUX_URL**    | _required_ - URL of the InfluxDB instance that should be used                                                 | 'http://localhost:8086'   |
| **INFLUX_TOKEN**  | _required_ - Token to access InfluxDB (can be generated in the InfluxDB UI)                                   | 'AmfWLq5PbC_89NkpO\[...]' |
| **INFLUX_ORG**    | _required_ - Organization name of the InfluxDB instance                                                       | 'DevOpsMetrics'           |
| **INFLUX_BUCKET** | _required_ - Name of the InfluxDB bucket where the events should be stored                                    | 'events'                  |
| **GITHUB_URL**    | _optional_ - GitHub URL of GitHub Server where the tracked Repo is stored (default: 'https://api.github.com') | 'https://api.github.com'  |


