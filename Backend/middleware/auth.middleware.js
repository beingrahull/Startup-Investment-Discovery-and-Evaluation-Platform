const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blacklist.model");

module.exports = async function verifyToken(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const isBlacklisted = await Blacklist.exists({ token });
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: "Token revoked" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};