const express = require("express");
const router = express.Router();

const {
  createConnection,
  listMyConnections,
  updateConnectionStatus,
} = require("../controllers/connection.controller");

const verifyToken = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const {
  createConnectionRules,
  validateCreateConnection,
} = require("../middleware/connection.middleware");

router.post(
  "/",
  verifyToken,
  requireRole("investor"),
  createConnectionRules,
  validateCreateConnection,
  createConnection
);

router.get("/mine", verifyToken, listMyConnections);

router.patch("/:id", verifyToken, requireRole("founder"), updateConnectionStatus);

module.exports = router;