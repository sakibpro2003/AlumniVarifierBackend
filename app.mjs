import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.mjs";
import userRoutes from "./routes/users.mjs";
import guestRoutes from "./routes/guests.mjs";

dotenv.config();

const DEFAULT_MONGO_URI = "mongodb://127.0.0.1:27017/qr_secure";

let connectionPromise;

export function getMongoUri() {
  return process.env.MONGODB_URI || DEFAULT_MONGO_URI;
}

export function connectToDatabase() {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(getMongoUri(), {
      serverSelectionTimeoutMS: 5000,
    });
  }
  return connectionPromise;
}

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
      credentials: true,
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/guests", guestRoutes);

  return app;
}
