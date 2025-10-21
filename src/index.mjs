"use strict";

import { config } from "./config/env.mjs";
import { createApp } from "./app.mjs";
import { ensureBootstrap } from "./bootstrap.mjs";

async function start() {
  try {
    await ensureBootstrap();
    console.log("[server] Connected to MongoDB.");
  } catch (error) {
    console.error("[server] Failed to connect to MongoDB:", error);
    process.exit(1);
  }

  const app = createApp();

  app.listen(config.port, () => {
    console.log(`[server] Listening on port ${config.port}`);
  });
}

start().catch((error) => {
  console.error("[server] Unexpected startup error:", error);
  process.exit(1);
});
