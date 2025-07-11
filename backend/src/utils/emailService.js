require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true",
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: false,
  },
});

const generateMailOptions = (to, subject, html) => ({
  from: `"Car Rental Service" <${process.env.EMAIL_USER}>`,
  to,
  subject,
  html,
});
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = generateMailOptions(to, subject, html);
    await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${subject}`);
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw new Error("Email sending failed");
  }
};
const sendVerificationEmail = async (email, verificationLink) => {
  try {
    if (!email || !verificationLink)
      throw new Error("Invalid email or verification link");

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333;">Welcome!</h2>
      <p style="font-size: 16px; color: #555;">
        Please verify your email address by clicking the button below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" 
           style="background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; font-size: 18px; border-radius: 5px;">
          Verify Email
        </a>
      </div>
      <p style="font-size: 14px; color: #999;">
        This link will expire in 10 minutes. If you did not sign up, you can safely ignore this email.
      </p>
    </div>
  `;


    await sendEmail(email, "Verify Your Email", html);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Failed to send verification email:", error.message);
    throw new Error("Failed to send verification email");
  }
};

const verifyEmailCode = async (email, code) => {
  try {
    const user = await User.findOne({ email });

    if (!user) throw new Error("User not found");

    if (
      user.verificationCode !== Number(code) ||
      user.verificationCodeExpires < Date.now()
    ) {
      throw new Error("Invalid or expired verification code");
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    return { message: "Email verified successfully" };
  } catch (error) {
    console.error("Email verification failed:", error.message);
    throw new Error(error.message);
  }
};

const sendPasswordResetEmail = async (email, code) => {
  try {
    if (!email) throw new Error("Invalid email address");

    console.log(`Sending Reset Code: ${code}`);

    const html = `
      <p>Your password reset code is:</p>
      <h2 style="color:red;">${code}</h2>
      <p>This code expires in 10 minutes.</p>
    `;

    await sendEmail(email, "Password Reset Code", html);
    console.log("Password reset email sent successfully");
  } catch (error) {
    console.error("Failed to send password reset code:", error.message);
    throw new Error("Failed to send password reset code");
  }
};

const resetPassword = async (email, resetCode, newPassword) => {
  try {
    const user = await User.findOne({ email });

    if (!user) throw new Error("User not found");

    if (
      user.resetCode !== Number(resetCode) ||
      user.resetCodeExpires < Date.now()
    ) {
      throw new Error("Invalid or expired reset code");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    return { message: "Password changed successfully" };
  } catch (error) {
    console.error("Password reset failed:", error.message);
    throw new Error(error.message);
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  verifyEmailCode,
  resetPassword,
};
