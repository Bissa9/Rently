const { generateToken } = require("../utils/jwtservice");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      drivingLicense,
      dateOfBirth,
      address,
      isCarOwner,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const licenseExists = await User.findOne({
      "drivingLicense.number": String(drivingLicense).trim(),
    });

    if (licenseExists) {
      return res.status(400).json({
        success: false,
        message: "This driving license is already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      drivingLicense,
      dateOfBirth,
      address,
      isCarOwner,
      isVerified: false,
    });

    const verificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

    await sendVerificationEmail(email, verificationLink);
    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration failed:", error.message);

     if (error.code === 11000 && error.keyPattern?.["drivingLicense.number"]) {
    return res.status(400).json({
      success: false,
      message: "This driving license is already in use",
    });
  }
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=fail`);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?verified=fail`);
    }

    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=success`);
  } catch (error) {
    console.error("Email verification failed:", error.message);
    return res.redirect(`${process.env.FRONTEND_URL}/login?verified=fail`);
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });
    }

    const verificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const verificationLink = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${verificationToken}`;

    await sendVerificationEmail(email, verificationLink);

    res
      .status(200)
      .json({
        success: true,
        message: "Verification email resent successfully",
      });
  } catch (error) {
    console.error("Resend verification email failed:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to resend verification email" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ success: false, message: "Email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      userId: user._id,
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }
    const resetCode = crypto.randomInt(100000, 999999);
    const resetCodeExpires = Date.now() + 10 * 60 * 1000;
    user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          "resetPassword.code": resetCode,
          "resetPassword.expires": resetCodeExpires,
        },
      },
      { new: true }
    );

    console.log(
      `Stored Reset Code in DB: ${
        user.resetPassword.code
      }, Expires at: ${new Date(user.resetPassword.expires)}`
    );

    await sendPasswordResetEmail(email, resetCode);

    res.status(200).json({
      success: true,
      message: "Password reset email sent successfully",
    });
  } catch (error) {
    console.error("Forgot password failed:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to send reset email" });
  }
};
const verifyResetCode = async (req, res) => {
  try {
    const { email, resetCode } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.resetPassword?.code || user.resetPassword.expires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset code" });
    }

    if (user.resetPassword.code !== Number(resetCode)) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect reset code" });
    }

    res.status(200).json({ success: true, message: "Reset code verified" });
  } catch (error) {
    console.error("Verify reset code failed:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Verification failed",
        error: error.message,
      });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    // Clear reset code and expiration
    user.resetPassword = { code: null, expires: null };
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error("Password change failed:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Password reset failed",
        error: error.message,
      });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendVerificationEmail,
};
