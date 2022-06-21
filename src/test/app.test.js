const request = require("supertest");
const app = require("../app");

describe("Test app.js", () => {
  test("Root route should be returning 200", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });

  test("Swagger route should be returning 200", async () => {
    const response = await request(app).get("/swagger/");
    console.log(response);
    expect(response.statusCode).toBe(200);
  });
});
