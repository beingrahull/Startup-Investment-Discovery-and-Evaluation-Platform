const express = require("express");
const router = express.Router();

const accountcontrol = require("../controllers/user.controller");

const {
  registerRules,
  validateRegistration,
} = require("../middleware/registration.middleware");

const {
  loginRules,
  validateLogin,
} = require("../middleware/login.middleware");


router.post("/register", registerRules, validateRegistration, accountcontrol.RegisterUser);
router.post("/login",loginRules,validateLogin,accountcontrol.LoginUser)
router.post("/logout", accountcontrol.Logout);     


module.exports = router;