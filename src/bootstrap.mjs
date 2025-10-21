"use strict";

import { connectToDatabase } from "./config/database.mjs";

let bootstrapPromise = null;

export async function ensureBootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = connectToDatabase().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }

  return bootstrapPromise;
}
