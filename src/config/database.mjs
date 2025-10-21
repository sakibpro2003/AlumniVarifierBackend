"use strict";

import mongoose from "mongoose";
import { config } from "./env.mjs";

let connectionPromise;

export function connectToDatabase() {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
  }
  return connectionPromise;
}

export function getConnectionStatus() {
  const readyState = mongoose.connection.readyState;
  switch (readyState) {
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 0:
      return "disconnected";
    default:
      return "unknown";
  }
}
