const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,   
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      enum: ["logout", "revoked", "rotation"],
      default: "logout",
    },
  },
  { timestamps: true }
);

blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Blacklist", blacklistSchema);