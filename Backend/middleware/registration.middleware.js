const { body, validationResult } = require("express-validator");



const registerRules = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ max: 80 }).withMessage("Name must be under 80 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Za-z]/).withMessage("Password must contain a letter")
    .matches(/\d/).withMessage("Password must contain a number"),

  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["founder", "investor"]).withMessage("Role must be founder or investor"),

  
  body("profile.companyName")
    .if(body("role").equals("founder"))
    .trim()
    .notEmpty().withMessage("Company name is required for founders"),

  body("profile.designation")
    .if(body("role").equals("founder"))
    .trim()
    .notEmpty().withMessage("Designation is required for founders"),


    body("profile.investorType")
    .if(body("role").equals("investor"))
    .isIn(["angel", "vc", "syndicate", "corporate", "other"])
    .withMessage("Invalid investor type"),

  body("profile.investmentRange.min")
    .if(body("role").equals("investor"))
    .isNumeric().withMessage("Minimum investment must be a number"),

  body("profile.investmentRange.max")
    .if(body("role").equals("investor"))
    .isNumeric().withMessage("Maximum investment must be a number"),
];



function validateRegistration(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
}

module.exports = { registerRules, validateRegistration };