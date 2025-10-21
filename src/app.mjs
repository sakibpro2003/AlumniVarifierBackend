"use strict";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import { config } from "./config/env.mjs";
import { getConnectionStatus } from "./config/database.mjs";
import apiRoutes from "./routes/index.mjs";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.mjs";

export function createApp() {
  const app = express();

  const corsOrigins =
    config.corsOrigin === "*"
      ? true
      : config.corsOrigin
          .split(",")
          .map((origin) => origin.trim())
          .filter(Boolean);

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(config.env === "production" ? "combined" : "dev"));

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      environment: config.env,
      database: getConnectionStatus(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/api", apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
