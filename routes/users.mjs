import express from "express";
import User from "../models/User.mjs";
import { adminRequired, authRequired, hashPassword } from "../utils/auth.mjs";

const router = express.Router();

router.use(authRequired);

router.get("/", adminRequired, async (_req, res) => {
  const users = await User.find({}, { username: 1, isAdmin: 1 })
    .sort({ createdAt: 1 })
    .lean();
  res.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
    })),
  });
});

router.post("/", adminRequired, async (req, res) => {
  try {
    const { username, password, isAdmin = false } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const existing = await User.findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, "i") },
    });
    if (existing) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      username: username.trim(),
      passwordHash,
      isAdmin: Boolean(isAdmin),
    });

    return res.status(201).json({
      user: {
        id: user._id.toString(),
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("[users] create failed", error);
    return res.status(500).json({ message: "Failed to create user." });
  }
});

export default router;
