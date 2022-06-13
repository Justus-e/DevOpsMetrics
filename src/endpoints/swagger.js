const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const express = require("express");
const router = express.Router();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DevOpsMetrics API",
      version: "1.0.0",
      description:
        "This API is collecting events via the /events endpoint and will calculate the four DORA metrics from them.",
      contact: {
        name: "Justus Ernst",
        url: "https://github.com/justus-e",
        email: "justernst.je+devopsmetrics@gmail.com",
      },
    },
    servers: [
      {
        url: "http://localhost:8080/api/",
      },
      {
        url: "https://dev-ops-metrics.herokuapp.com/api/",
      },
    ],
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-KEY",
        },
      },
    },
  },
  apis: ["./src/endpoints/*.js"],
};

const specs = swaggerJsdoc(options);
router.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));

module.exports = router;
