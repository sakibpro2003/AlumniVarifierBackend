"use strict";

import jwt from "jsonwebtoken";
import { config } from "../config/env.mjs";

const TOKEN_OPTIONS = {
  expiresIn: "7d",
};

export function signToken(user) {
  return jwt.sign(
    {
      sub: user.id ?? user._id?.toString(),
      isAdmin: Boolean(user.isAdmin),
      isValidated: Boolean(user.isValidated),
    },
    config.jwtSecret,
    TOKEN_OPTIONS
  );
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
