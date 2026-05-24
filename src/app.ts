import cors from "cors";
import type { Application, Request, Response } from "express";
import express from "express";

import globalErrorHandler from "./middleware/globalErrorHandler";
import notFound from "./middleware/notFound";
import { authRoute } from "./modules/auth/auth.route";
import { issuesRoute } from "./modules/issues/issues.route";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);
app.use("/api/issues", issuesRoute);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "DevPulse API running",
  });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;
