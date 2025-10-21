"use strict";

import { createApp } from "../src/app.mjs";
import { ensureBootstrap } from "../src/bootstrap.mjs";

let app;

export default async function handler(req, res) {
  try {
    await ensureBootstrap();
  } catch (error) {
    console.error("[serverless] Failed to bootstrap:", error);
    res.statusCode = 500;
    res.end("Internal server error");
    return;
  }

  if (!app) {
    app = createApp();
  }

  return app(req, res);
}
