"use strict";

import { Router } from "express";
import { createHash } from "node:crypto";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.mjs";
import { requireAdmin, requireAuth } from "../middleware/auth.mjs";
import { Guest } from "../models/guest.mjs";

const router = Router();

const createGuestSchema = z.object({
  envelope: z
    .string()
    .min(1, "QR envelope is required.")
    .max(4096, "QR envelope is too large."),
  name: z.string().min(1, "Guest name is required."),
  batch: z.string().optional(),
  generatedBy: z.string().min(1, "Generator name is required."),
  issuedAt: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || !Number.isNaN(new Date(value).getTime()),
      "issuedAt must be a valid ISO date string."
    ),
});

router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const guests = await Guest.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({
      guests: guests.map((guest) => ({
        id: guest._id.toString(),
        name: guest.name,
        batch: guest.batch,
        generatedBy: guest.generatedBy,
        issuedAt: guest.issuedAt,
        createdBy: guest.createdBy?.toString() ?? null,
        createdAt: guest.createdAt,
      })),
    });
  })
);

router.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    let payload;
    try {
      payload = createGuestSchema.parse(req.body ?? {});
    } catch (error) {
      return res.status(400).json({
        message: "Invalid guest data.",
        errors: error.issues ?? [],
      });
    }

    const envelopeHash = createHash("sha256")
      .update(payload.envelope)
      .digest("hex");

    const existing = await Guest.findOne({ envelopeHash });
    if (existing) {
      return res.status(409).json({
        message: "Duplicate QR detected.",
        guest: existing.toSafeObject(),
      });
    }

    const issuedAtDate = payload.issuedAt
      ? new Date(payload.issuedAt)
      : new Date();
    if (Number.isNaN(issuedAtDate.getTime())) {
      return res.status(400).json({ message: "Invalid issuedAt value." });
    }

    const guest = await Guest.create({
      name: payload.name.trim(),
      batch: payload.batch?.trim() ?? "",
      generatedBy: payload.generatedBy.trim(),
      issuedAt: issuedAtDate,
      createdBy: req.user._id,
      envelopeHash,
    });

    res.status(201).json({ guest: guest.toSafeObject() });
  })
);

export default router;
