import cors from "cors";
import express from "express";
import type { Application } from "express";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "DevPulse API running",
  });
});

export default app;
