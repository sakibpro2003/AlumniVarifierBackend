import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.mjs";

const JWT_SECRET = process.env.JWT_SECRET || "qr-secure-dev-secret";

export function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function authRequired(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).lean();
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    req.user = {
      id: user._id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
    };
    next();
  } catch (error) {
    console.error("[auth] verification failed", error);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function adminRequired(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required." });
  }
  return next();
}

function extractToken(req) {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");
  return token;
}
