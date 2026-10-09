const express = require("express");
const router = express.Router();

const {
  createAsk,
  listAsks,
  getAsk,
  listMyAsks,
} = require("../controllers/ask.controller");

const verifyToken = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");
const {
  createAskRules,
  validateCreateAsk,
} = require("../middleware/ask.middleware");



router.post(
  "/",
  verifyToken,
  requireRole("founder"),
  createAskRules,
  validateCreateAsk,
  createAsk
);



router.get("/", verifyToken, listAsks);
router.get("/:id", verifyToken, getAsk);
router.get("/mine", verifyToken, requireRole("founder"), listMyAsks);


module.exports = router;