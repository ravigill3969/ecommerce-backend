import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { sendEmail } from "../utils/sendEmail.js";

//register
export const register = async (req, res) => {
  const { email, username, password, userType } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be atleast 6 characters long" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ email, username, password, userType });

    const secretKey = process.env.JWT_SECRET;

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "30d",
      algorithm: "HS256",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .status(201)
      .json({
        token,
        status: "success",
        message: "User created successfully",
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePasswords(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const secretKey = process.env.JWT_SECRET;

    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "30d",
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
      .status(200)
      .json({
        token,
        status: "success",
        message: "User logged in successfully",
        user,
      });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//logout
export const logout = async (req, res) => {
  res
    .cookie("token", "wtf", {
      httpOnly: true,
      expires: new Date(0),
      sameSite: true,
    })
    .status(200)
    .json({ message: "User logged out successfully" });
};

//isVerified
export const isVerified = async (req, res, next) => {
  console.log("isVerified");

  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "You need to login first" });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.log("Token verification error", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

//isAdmin
export const isAdmin = async (req, res, next) => {
  console.log("isAdmin");
  if (!req.userId) {
    return res.status(401).json({ message: "User ID is missing from request" });
  }

  // console.log(req.userId)
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.userType == "admin") {
      next();
    } else {
      res
        .status(401)
        .json({ message: "You are not allowed to perform this task!" });
    }
  } catch (error) {
    console.log("isAdmin error", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const isAdminOrSeller = async (req, res, next) => {
  console.log("isAdminOrSeller");
  if (!req.userId) {
    return res.status(401).json({ message: "User ID is missing from request" });
  }

  // console.log(req.userId)
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.userType == "admin" || user.userType == "seller") {
      next();
    } else {
      res
        .status(401)
        .json({ message: "You are not allowed to perform this task!" });
    }
  } catch (error) {
    console.log("isAdminOrSeller error", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.userId;

  if (!oldPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.comparePasswords(oldPassword);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    res
      .status(200)
      .json({ status: "success", message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate the reset token
    const token = await user.generateForgotPasswordToken();

    // Construct the reset link
    const resetLink = `http://localhost:7000/api/auth/reset-password/${token}`;

    // Send the email using the sendEmail function
    await sendEmail(
      user.email,
      "Password Reset Request",
      `You requested a password reset. Click the link below to reset your password.`,
      `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, please ignore this email.</p>`
    );

    res
      .status(200)
      .json({ message: "Password reset link sent to your email address" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    // Find the user by the reset token
    const user = await User.findOne({
      forgotPasswordToken: token,
      tokenExpiryTime: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear the reset token fields
    user.forgotPasswordToken = undefined;
    user.tokenExpiryTime = undefined;

    // Save the updated user to the database
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "fail", message: "Server error" });
  }
};
