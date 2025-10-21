"use strict";

import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.mjs";
import { User } from "../models/user.mjs";
import { signToken } from "../utils/token.mjs";
import { requireAuth } from "../middleware/auth.mjs";

const router = Router();

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(64, "Username cannot exceed 64 characters."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(128, "Password cannot exceed 128 characters."),
});

const loginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    let payload;
    try {
      payload = registerSchema.parse(req.body ?? {});
    } catch (error) {
      return res.status(400).json({
        message: "Invalid registration data.",
        errors: error.issues ?? [],
      });
    }

    const existing = await User.findOne({ username: payload.username });
    if (existing) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const passwordHash = await User.hashPassword(payload.password);
    const user = await User.create({
      username: payload.username,
      passwordHash,
      isAdmin: false,
    });

    res.status(201).json({
      message: "Account created. Await administrator approval before signing in.",
      user: user.toSafeObject(),
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    let credentials;
    try {
      credentials = loginSchema.parse(req.body ?? {});
    } catch (error) {
      return res.status(400).json({
        message: "Invalid username or password.",
        errors: error.issues ?? [],
      });
    }

    const user = await User.findOne({
      username: credentials.username,
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const passwordValid = await user.verifyPassword(credentials.password);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid username or password." });
    }

    if (!user.isValidated && !user.isAdmin) {
      return res.status(403).json({
        message: "Account pending administrator approval.",
      });
    }

    const token = signToken(user);
    res.json({ token, user: user.toSafeObject() });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user.toSafeObject() });
  })
);

export default router;
