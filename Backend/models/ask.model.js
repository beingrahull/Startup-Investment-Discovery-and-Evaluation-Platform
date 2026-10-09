const mongoose = require("mongoose");

const askSchema = new mongoose.Schema(
  {
    founder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    startupName: {
      type: String,
      required: [true, "Startup name is required"],
      trim: true,
      maxlength: 80,
    },
    tagline: {
      type: String,
      required: [true, "Tagline is required"],
      trim: true,
      maxlength: 120, // one-liner pitch
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 2000,
    },
    website: { type: String, trim: true },
    logoUrl: { type: String, trim: true },

    industry: {
      type: String,
      required: true,
      enum: [
        "fintech",
        "healthtech",
        "edtech",
        "saas",
        "ecommerce",
        "marketplace",
        "ai_ml",
        "cleantech",
        "agritech",
        "logistics",
        "gaming",
        "other",
      ],
    },
    stage: {
      type: String,
      required: true,
      enum: ["idea", "pre-seed", "seed", "seriesA", "seriesB", "growth"],
    },
    location: { type: String, trim: true },


    fundingGoal: {
      type: Number,
      required: [true, "Funding goal is required"],
      min: 1,
    },
    currency: { type: String, default: "INR" },
    equityOffered: {
      type: Number, // percentage
      min: 0,
      max: 100,
    },
    useOfFunds: [{ type: String, trim: true }], // e.g. ["Product", "Hiring", "Marketing"]

    traction: {
      monthlyRevenue: { type: Number, default: 0 },
      activeUsers: { type: Number, default: 0 },
      growthRate: { type: Number, default: 0 }, // % MoM
      keyMilestones: [{ type: String }],
    },

    teamSize: { type: Number, default: 1 },

    pitchDeckUrl: { type: String, trim: true },

    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

askSchema.index({ status: 1, industry: 1, stage: 1, createdAt: -1 });

module.exports = mongoose.model("Ask", askSchema);