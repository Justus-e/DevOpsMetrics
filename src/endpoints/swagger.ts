import * as swaggerJSDoc from "swagger-jsdoc";
import { serve, setup } from "swagger-ui-express";
import { Router } from "express";

const router = Router();

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DevOpsMetrics API",
      version: "1.0.0",
      description:
        "This API is collecting events via the /events endpoint and will send those to influxDB and calculate the four DORA metrics from them.",
      contact: {
        name: "Justus Ernst",
        url: "https://github.com/justus-e",
        email: "justernst.je+devopsmetrics@gmail.com",
      },
    },
    servers: [
      {
        url: "https://dev-ops-metrics.herokuapp.com/api/",
      },
      {
        url: "http://localhost:8080/api/",
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

const specs = swaggerJSDoc(options);
router.use("/swagger", serve, setup(specs));

export default router;
