const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")




const userSchema=new mongoose.Schema(
    {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["founder", "investor"],
        message: "{VALUE} is not a valid role",
      },
      required: true,
    },
    profile: {
      // common
      phone: { type: String, trim: true },
      bio: { type: String, maxlength: 500 },
      linkedin: { type: String, trim: true },
      avatarUrl: { type: String },

      // founder
      companyName: { type: String, trim: true },
      designation: { type: String, trim: true },
      location: { type: String, trim: true },

      // investor
      investorType: {
        type: String,
        enum: ["angel", "vc", "syndicate", "corporate", "other"],
      },
      investmentRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: "INR" },
      },
      preferredIndustries: [{ type: String }],
      preferredStages: [
        {
          type: String,
          enum: ["idea", "pre-seed", "seed", "seriesA", "seriesB", "growth"],
        },
      ],
    },
  },
  { timestamps: true }
)



userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});



userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};



userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = mongoose.model("User", userSchema);