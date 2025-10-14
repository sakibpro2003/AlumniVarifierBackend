import express from "express";
import Guest from "../models/Guest.mjs";
import { authRequired, adminRequired } from "../utils/auth.mjs";

const router = express.Router();

router.use(authRequired);

router.post("/", async (req, res) => {
  try {
    const { name, batch, generatedBy, issuedAt } = req.body;
    if (!name || !batch || !generatedBy) {
      return res
        .status(400)
        .json({ message: "Name, batch, and generatedBy are required." });
    }

    const guest = await Guest.create({
      name,
      batch,
      generatedBy,
      issuedAt,
    });

    return res.status(201).json({
      guest: {
        id: guest._id.toString(),
        name: guest.name,
        batch: guest.batch,
        generatedBy: guest.generatedBy,
        issuedAt: guest.issuedAt,
      },
    });
  } catch (error) {
    console.error("[guests] create failed", error);
    return res.status(500).json({ message: "Failed to store guest." });
  }
});

router.get("/", adminRequired, async (_req, res) => {
  const guests = await Guest.find()
    .sort({ createdAt: -1 })
    .lean();
  res.json({
    guests: guests.map((guest) => ({
      id: guest._id.toString(),
      name: guest.name,
      batch: guest.batch,
      generatedBy: guest.generatedBy,
      issuedAt: guest.issuedAt,
      createdAt: guest.createdAt,
    })),
  });
});

export default router;
