const { body, validationResult } = require("express-validator");

const INDUSTRIES = [
  "fintech", "healthtech", "edtech", "saas", "ecommerce",
  "marketplace", "ai_ml", "cleantech", "agritech", "logistics",
  "gaming", "other",
];

const STAGES = ["idea", "pre-seed", "seed", "seriesA", "seriesB", "growth"];

const createAskRules = [
  body("startupName")
    .trim()
    .notEmpty().withMessage("Startup name is required")
    .isLength({ max: 80 }).withMessage("Startup name must be under 80 characters"),

  body("tagline")
    .trim()
    .notEmpty().withMessage("Tagline is required")
    .isLength({ max: 120 }).withMessage("Tagline must be under 120 characters"),

  body("description")
    .trim()
    .isLength({ min: 30, max: 2000 })
    .withMessage("Description must be between 30 and 2000 characters"),

  body("industry")
    .notEmpty().withMessage("Industry is required")
    .isIn(INDUSTRIES).withMessage("Invalid industry"),

  body("stage")
    .notEmpty().withMessage("Stage is required")
    .isIn(STAGES).withMessage("Invalid stage"),

  body("fundingGoal")
    .notEmpty().withMessage("Funding goal is required")
    .isNumeric().withMessage("Funding goal must be a number")
    .custom((v) => Number(v) > 0).withMessage("Funding goal must be positive"),

  body("equityOffered")
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage("Equity must be between 0 and 100"),

  body("website").optional().isURL().withMessage("Website must be a valid URL"),
  body("pitchDeckUrl").optional().isURL().withMessage("Pitch deck must be a valid URL"),

  body("teamSize").optional().isInt({ min: 1 }).withMessage("Team size must be at least 1"),

  // optional array fields — just ensure they're arrays if present
  body("useOfFunds").optional().isArray().withMessage("useOfFunds must be an array"),
  body("traction.keyMilestones").optional().isArray().withMessage("keyMilestones must be an array"),
];

function validateCreateAsk(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = { createAskRules, validateCreateAsk, INDUSTRIES, STAGES };