const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ask",
      required: true,
      index: true,
    },
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

connectionSchema.index({ investor: 1, ask: 1 }, { unique: true });

module.exports = mongoose.model("Connection", connectionSchema);