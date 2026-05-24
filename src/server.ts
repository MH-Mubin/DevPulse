import app from "./app.js";
import config from "./config/env";
import { initDB } from "./db";

const main = async () => {
  await initDB();
  app.listen(config.port, () => {
    console.log(`App is listening on port ${config.port}`);
  });
};

main();
