import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const config = {
  port: Number(process.env.PORT ?? 4000),
  connectionString: requireEnv("CONNECTIONSTRING"),
  jwtSecret: requireEnv("JWT_SECRET"),
};

export default config;
