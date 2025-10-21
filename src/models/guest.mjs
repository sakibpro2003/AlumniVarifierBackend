"use strict";

import mongoose from "mongoose";

const { Schema } = mongoose;

const guestSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    batch: {
      type: String,
      trim: true,
      default: "",
    },
    generatedBy: {
      type: String,
      required: true,
      trim: true,
    },
    envelopeHash: {
      type: String,
      required: true,
    },
    issuedAt: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

guestSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    batch: this.batch,
    generatedBy: this.generatedBy,
    issuedAt: this.issuedAt,
    createdBy: this.createdBy.toString(),
    createdAt: this.createdAt,
  };
};

guestSchema.index(
  { envelopeHash: 1 },
  {
    unique: true,
    partialFilterExpression: { envelopeHash: { $exists: true } },
  }
);

export const Guest =
  mongoose.models.Guest || mongoose.model("Guest", guestSchema);
