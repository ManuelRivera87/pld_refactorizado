import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PLD Backend API",
      version: "0.1.0",
      description: "Documentacion inicial de la API REST del backend PLD."
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: "Servidor local"
      }
    ]
  },
  apis: ["./src/routes/**/*.ts", "./dist/routes/**/*.js"]
});
