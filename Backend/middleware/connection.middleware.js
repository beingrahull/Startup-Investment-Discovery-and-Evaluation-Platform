const { body, validationResult } = require("express-validator");

const createConnectionRules = [
  body("ask")
    .notEmpty().withMessage("Ask id is required")
    .isMongoId().withMessage("Invalid ask id"),

  body("message")
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage("Message must be under 500 characters"),
];

function validateCreateConnection(req, res, next) {
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

module.exports = { createConnectionRules, validateCreateConnection };