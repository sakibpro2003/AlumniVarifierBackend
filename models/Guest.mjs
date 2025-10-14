import mongoose from "mongoose";

const guestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    batch: { type: String, required: true, trim: true },
    generatedBy: { type: String, required: true, trim: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Guest", guestSchema);
