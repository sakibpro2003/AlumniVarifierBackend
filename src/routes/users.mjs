"use strict";

import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.mjs";
import { requireAdmin, requireAuth } from "../middleware/auth.mjs";
import { User } from "../models/user.mjs";

const router = Router();

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long.")
    .max(64, "Username cannot exceed 64 characters."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long.")
    .max(128, "Password cannot exceed 128 characters."),
  isAdmin: z.boolean().optional(),
  isValidated: z.boolean().optional(),
});

const updateValidationSchema = z.object({
  isValidated: z.boolean(),
});

router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const users = await User.find().sort({ createdAt: 1 });
    res.json({ users: users.map((user) => user.toSafeObject()) });
  })
);

router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    let payload;
    try {
      payload = createUserSchema.parse(req.body ?? {});
    } catch (error) {
      return res.status(400).json({
        message: "Invalid user data.",
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
      isAdmin: Boolean(payload.isAdmin),
      isValidated: payload.isValidated ?? Boolean(payload.isAdmin),
    });

    res.status(201).json({ user: user.toSafeObject() });
  })
);

router.patch(
  "/:id/validation",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const paramsSchema = z.object({
      id: z
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid user id."),
    });

    const { id } = paramsSchema.parse(req.params ?? {});
    const payload = updateValidationSchema.parse(req.body ?? {});

    const user = await User.findByIdAndUpdate(
      id,
      { isValidated: payload.isValidated },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: `User ${payload.isValidated ? "validated" : "set to pending"}.`,
      user: user.toSafeObject(),
    });
  })
);

export default router;
