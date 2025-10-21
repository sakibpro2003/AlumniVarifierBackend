"use strict";

import { verifyToken } from "../utils/token.mjs";
import { User } from "../models/user.mjs";

function extractToken(headerValue) {
  if (!headerValue || typeof headerValue !== "string") {
    return null;
  }
  const [scheme, token] = headerValue.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
}

export async function requireAuth(req, res, next) {
  const token = extractToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: "Authorization header missing." });
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    if (!user.isValidated && !user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Account pending administrator approval." });
    }
    req.user = user;
    req.auth = {
      userId: user._id.toString(),
      isAdmin: Boolean(user.isAdmin),
      isValidated: Boolean(user.isValidated),
      tokenPayload: payload,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res
      .status(403)
      .json({ message: "Administrator privileges required." });
  }
  return next();
}
