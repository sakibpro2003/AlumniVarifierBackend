"use strict";

import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 5000;
const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/qr_secure";
const DEFAULT_JWT_SECRET = "qr-secure-development-secret";

function parsePort(value) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PORT;
}

export const config = Object.freeze({
  env: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  mongoUri: process.env.MONGODB_URI ?? DEFAULT_MONGO_URI,
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  jwtSecret: process.env.JWT_SECRET ?? DEFAULT_JWT_SECRET,
});

export const isProduction = config.env === "production";
