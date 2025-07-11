const mongoose = require("mongoose");

const loyaltyProgramSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    discountCodes: [
      {
        code: String,
        redeemedAt: Date,
        used: {
          type: Boolean,
          default: false,
        },
      },
    ],
    pointsRedeemed: {
      type: Number,
      default: 0,
    },
    pointsBalance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
  },
  { timestamps: true }
);

loyaltyProgramSchema.pre("save", function (next) {
  if (this.isModified("pointsBalance") && this.status !== "expired") {
    this.expirationDate = new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000);
  }
  next();
});

const LoyaltyProgram = mongoose.model("LoyaltyProgram", loyaltyProgramSchema);
module.exports = LoyaltyProgram;
