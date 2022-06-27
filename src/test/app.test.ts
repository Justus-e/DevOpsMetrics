import request from "supertest";
import app from "../app";

process.env.INFLUX_URL = "http://localhost:8086";

describe("Test app.js", () => {
  test("Root route should be returning 200", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });

  test("Swagger route should be returning 200", async () => {
    const response = await request(app).get("/swagger/");
    expect(response.statusCode).toBe(200);
  });
});
