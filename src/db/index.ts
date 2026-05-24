import { Pool } from "pg";

import config from "../config/env";

const pool = new Pool({
  connectionString: config.connectionString,
});

const initDB = async (): Promise<void> => {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected Successfully");
  } catch {
    console.error("Database connection failed");
    throw new Error("Database connection failed");
  }
};

export { pool, initDB };
