"use strict";

import { isProduction } from "../config/env.mjs";

export function notFoundHandler(_req, res, _next) {
  res.status(404).json({ message: "Resource not found." });
}

export function errorHandler(err, _req, res, _next) {
  if (!isProduction) {
    console.error(err);
  }

  const status = err.status || err.statusCode || 500;
  const message =
    err.message || "An unexpected error occurred. Please try again later.";

  res.status(status).json({
    message,
    ...(isProduction
      ? null
      : {
          stack: err.stack,
        }),
  });
}
