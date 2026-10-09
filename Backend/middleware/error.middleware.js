module.exports = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};