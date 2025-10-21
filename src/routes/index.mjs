"use strict";

import { Router } from "express";
import authRoutes from "./auth.mjs";
import userRoutes from "./users.mjs";
import guestRoutes from "./guests.mjs";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/guests", guestRoutes);

export default router;
