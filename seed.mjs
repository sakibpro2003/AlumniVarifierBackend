import User from "./models/User.mjs";
import { hashPassword } from "./utils/auth.mjs";

const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "sakib2003";
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "pass1517";

export async function ensureAdminSeeded() {
  const existing = await User.findOne({
    username: { $regex: new RegExp(`^${DEFAULT_ADMIN_USERNAME}$`, "i") },
  });
  if (existing) {
    return;
  }

  const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
  await User.create({
    username: DEFAULT_ADMIN_USERNAME,
    passwordHash,
    isAdmin: true,
  });
  console.log(`[seed] Admin user "${DEFAULT_ADMIN_USERNAME}" created`);
}
