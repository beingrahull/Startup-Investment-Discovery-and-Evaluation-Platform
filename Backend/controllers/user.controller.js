const jwt=require("jsonwebtoken")
const { validationResult } = require('express-validator');
const Blacklist  = require("../models/blacklist.model")


const User=require("../models/user.model")

module.exports.RegisterUser= async function(req,res,next){
    try {
    const { name, email, password, role, profile = {} } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password,
      role,
      profile,
    });

    
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};



module.exports.LoginUser = async function (req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = user.generateToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.Logout = async function (req, res, next) {
  try {
    const token = req.cookies?.token;

    if (token) {
      const decoded = jwt.decode(token);
      const expiresAt = new Date(decoded.exp * 1000); 

      await Blacklist.updateOne(
        { token },
        { $setOnInsert: { token, expiresAt, reason: "logout" } },
        { upsert: true }
      );
    }

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};