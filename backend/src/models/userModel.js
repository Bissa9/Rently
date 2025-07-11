const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      lowercase: true,
    },
    password: { type: String, required: true },
    phone: {
      type: String,
      match: /^\+?[1-9]\d{1,14}$/,
      set: (v) => v.replace(/[-\s()]/g, ""),
    },
    drivingLicense: {
      type: {
        number: { type: String, required: true, unique: true },
        issuedDate: { type: Date, required: true },
        expiryDate: { type: Date, required: true },
      },
      required: true,
    },
    dateOfBirth: { type: Date, required: true },
    address: { type: String, required: true },
    isCarOwner: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    resetPassword: {
      code: { type: Number, default: null },
      expires: { type: Date, default: null },
    },
    profitBalance: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    withdrawalRequests: [{
      amount: { type: Number, required: true },
      status: {
        type: String, 
        enum: ['pending', 'processed', 'rejected'],
        default: 'pending'
      },
      method: String, // bank aw instapy aw ay method tanyaa
      details: mongoose.Schema.Types.Mixed, //details aktar 3ala el payment method
      createdAt: { type: Date, default: Date.now },
      processedAt: Date
    }]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
