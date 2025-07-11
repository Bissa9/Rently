const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    pickupLocation: {
      address: {
        city: { type: String, required: true },
        exactSpot: { type: String, required: true },
      },
    },
    paymentMethod: {
      type: String,
      enum: ["credit-card", "cash"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    totalCost: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "cancelled"],
      default: "pending",
    },
    discountApplied: {
      type: Number,
      default: 0,
    },

    paymentIntentId: { type: String },
  },
  { timestamps: true }
);

bookingSchema.post("save", async function (doc) {
  if (doc.status === "completed") {
    try {
      const User = mongoose.model("User");
      const LoyaltyProgram = mongoose.model("LoyaltyProgram");

      const user = await User.findById(doc.user);
      if (!user) throw new Error("User not found");

      let loyaltyProgram = await LoyaltyProgram.findOne({ user: doc.user });

      if (!loyaltyProgram) {
        loyaltyProgram = new LoyaltyProgram({
          user: doc.user,
          pointsBalance: 0,
          expirationDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 months
        });
      }
      const start = new Date(doc.startDate);
      const end = new Date(doc.endDate);
      const daysRented = Math.ceil((end - start) / (1000 * 3600 * 24));
      loyaltyProgram.pointsBalance += daysRented * 10;

      await loyaltyProgram.save();
    } catch (err) {
      console.error("Error updating loyalty program:", err);
    }
  }
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
