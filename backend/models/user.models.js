import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    address:{type:mongoose.Schema.Types.ObjectId,ref:"Address"},
    forgotPasswordToken: { type: String },
    tokenExpiryTime: { type: Date },
    userType: {
      type: String,
      enum: ["admin", "seller", "customer"],
      default: "customer",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

userSchema.methods.comparePasswords = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateForgotPasswordToken = async function () {
  const token = crypto.randomBytes(128).toString("hex");
  this.tokenExpiryTime = Date.now() + 3600000; // 1 hour
  this.forgotPasswordToken = token;

  await this.save();

  return token;
};

const User = mongoose.model("User", userSchema);
export default User;
