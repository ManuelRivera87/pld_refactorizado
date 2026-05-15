import { app } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const startServer = () => {
  app.listen(env.port, () => {
    console.log(`PLD backend listening on port ${env.port}`);
    console.log(`Swagger docs available at http://localhost:${env.port}/api-docs`);
  });

  void connectDatabase().catch((error) => {
    console.error("PostgreSQL connection failed");
    console.error(error);
  });
};

startServer();
