const request = require("supertest");

jest.mock("../influx", () => {
  return {
    writeDeploymentEvent: jest.fn(),
    writeChangeEvent: jest.fn(),
    writeIncidentEvent: jest.fn(),
    writeRestoreEvent: jest.fn(),
    flush: jest.fn(),
    queryEvents: jest.fn(),
    queryLastDeployEvent: jest.fn(),
  };
});

jest.mock("../auth", () => {
  return () => (_req, _res, next) => next();
});

const influx = require("../influx");

const app = require("../app");

describe("Test events.js", () => {
  test("invalid deployment request should NOT go thru", async () => {
    const reqBody = {
      eventType: "deployment",
      payload: {
        id: "dd05f3119a18f53d1e782384b8f47751479de472",
        repo: "justus-e/DevOpsMetrics",
      },
    };

    const response = await request(app).post("/api/events/").send(reqBody);
    expect(response.statusCode).toBe(400);
    expect(influx.writeDeploymentEvent).toBeCalledTimes(0);
  });

  test("valid deployment request should go thru", async () => {
    const reqBody = {
      eventType: "deployment",
      payload: {
        id: "dd05f3119a18f53d1e782384b8f47751479de472",
        changes: [
          "dd05f3119a18f53d1e782384b8f47751479de472",
          "79e10eec267bf99ec5a67acb28bc24b0eca1977a",
          "13fcc20de75badd00c2e1c94423a97383a4f2137",
        ],
        repo: "justus-e/DevOpsMetrics",
      },
    };

    const response = await request(app).post("/api/events/").send(reqBody);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Event of type 'deployment' added!");
    expect(influx.writeDeploymentEvent).toBeCalledWith(reqBody.payload);
  });

  test("invalid change request should NOT go thru", async () => {
    const reqBody = {
      eventType: "change",
      payload: {
        id: "dd05f3119a18f53d1e782384b8f47751479de472",
        repo: "justus-e/DevOpsMetrics",
      },
    };

    const response = await request(app).post("/api/events/").send(reqBody);
    expect(response.statusCode).toBe(400);
    expect(influx.writeChangeEvent).toBeCalledTimes(0);
  });

  test("valid change request should go thru", async () => {
    const reqBody = {
      eventType: "change",
      payload: {
        id: "dd05f3119a18f53d1e782384b8f47751479de472",
        ref: "refs/heads/main",
        timestamp: "2021-01-25T13:55:52Z",
        repo: "justus-e/DevOpsMetrics",
      },
    };

    const response = await request(app).post("/api/events/").send(reqBody);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Event of type 'change' added!");
    expect(influx.writeChangeEvent).toBeCalledWith(reqBody.payload);
    expect(influx.flush).toBeCalledTimes(1);
  });

  test("invalid incident request should NOT go thru", async () => {
    const reqBody = {
      eventType: "incident",
      payload: {
        id: 142812984,
        ref: "refs/heads/main",
        timestamp: "2021-01-25T13:55:52Z",
        repo: "justus-e/DevOpsMetrics",
      },
    };

    const response = await request(app).post("/api/events/").send(reqBody);
    expect(response.statusCode).toBe(400);
    expect(influx.writeIncidentEvent).toBeCalledTimes(0);
  });

  test("valid incident request should go thru", async () => {
    const reqBody = {
      eventType: "incident",
      payload: {
        id: "dd05f3119a18f53d1e782384b8f47751479de472",
        timestamp: "2021-01-25T13:55:52Z",
        repo: "justus-e/DevOpsMetrics",
      },
    };

    const response = await request(app).post("/api/events/").send(reqBody);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Event of type 'incident' added!");
    expect(influx.writeIncidentEvent).toBeCalledWith(reqBody.payload);
  });

  test("invalid restore request should NOT go thru", async () => {
    const reqBody = {
      eventType: "restore",
      payload: {
        id: "dd05f3119a18f53d1e782384b8f47751479de472",
        timestambb: "2021-01-25T13:55:52Z",
        repo: "justus-e/DevOpsMetrics",
      },
    };

    const response = await request(app).post("/api/events/").send(reqBody);
    expect(response.statusCode).toBe(400);
    expect(influx.writeRestoreEvent).toBeCalledTimes(0);
  });

  test("valid restore request should go thru", async () => {
    const reqBody = {
      eventType: "restore",
      payload: {
        id: "dd05f3119a18f53d1e782384b8f47751479de472",
        timestamp: "2021-01-25T15:55:52Z",
        repo: "justus-e/DevOpsMetrics",
      },
    };

    const response = await request(app).post("/api/events/").send(reqBody);
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Event of type 'restore' added!");
    expect(influx.writeRestoreEvent).toBeCalledWith(reqBody.payload);
  });
});
