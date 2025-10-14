import express from "express";
import User from "../models/User.mjs";
import { authRequired, signToken, verifyPassword } from "../utils/auth.mjs";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required." });
    }

    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username.trim()}$`, "i") },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("[auth] login failed", error);
    return res.status(500).json({ message: "Login failed." });
  }
});

router.get("/me", authRequired, (req, res) => {
  res.json({ user: req.user });
});

export default router;
