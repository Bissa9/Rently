const LoyaltyProgram = require("../models/loyaltyprogModel");

const generateDiscountCode = (points) => {
  return `DISCOUNT-${points}-${Date.now()}`;
};

const getLoyaltyProgram = async (req, res) => {
  try {
    const loyaltyProgram = await LoyaltyProgram.findOne({ user: req.user._id });

    if (!loyaltyProgram) {
      return res.status(200).json({
        message: "User has no loyalty program yet",
        noLoyaltyYet: true,
        loyaltyProgram: null,
      });
    }

    res.status(200).json({
      message: "Loyalty program details fetched successfully",
      loyaltyProgram,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching loyalty program details",
      error: error.message,
    });
  }
};

const redeemPoints = async (req, res) => {
  try {
    const { pointsToRedeem } = req.body;
    const loyaltyProgram = await LoyaltyProgram.findOne({ user: req.user._id });

    if (!loyaltyProgram) {
      return res.status(404).json({ message: "Loyalty program not found" });
    }

    if (loyaltyProgram.status === "expired") {
      return res
        .status(400)
        .json({ message: "Your loyalty program has expired" });
    }

    if (
      !pointsToRedeem ||
      pointsToRedeem <= 0 ||
      pointsToRedeem > loyaltyProgram.pointsBalance
    ) {
      return res.status(400).json({ message: "Invalid points amount" });
    }

    const discountCode = generateDiscountCode(pointsToRedeem);

    loyaltyProgram.pointsBalance -= pointsToRedeem;
    loyaltyProgram.pointsRedeemed += pointsToRedeem;
    loyaltyProgram.discountCodes.push({
      code: discountCode,
      redeemedAt: new Date(),
      used: false,
    });

    await loyaltyProgram.save();

    res.status(200).json({
      message: "Points redeemed successfully",
      discountCode,
      remainingPoints: loyaltyProgram.pointsBalance,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error redeeming points", error: error.message });
  }
};

const addPoints = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "completed") {
      return res
        .status(400)
        .json({ message: "Points can only be added for completed bookings" });
    }

    const loyaltyProgram = await LoyaltyProgram.findOne({ user: booking.user });

    if (!loyaltyProgram) {
      return res
        .status(404)
        .json({ message: "Loyalty program not found for this user" });
    }

    const pointsEarned = Math.floor(booking.totalCost/ 10); // 1 point for every $10 spent
    loyaltyProgram.pointsBalance += pointsEarned;
    loyaltyProgram.pointsEarned += pointsEarned;

    await loyaltyProgram.save();

    res.status(200).json({
      message: "Points added successfully",
      pointsEarned,
      pointsBalance: loyaltyProgram.pointsBalance,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error adding points", error: error.message });
  }
};



module.exports = { getLoyaltyProgram, redeemPoints, addPoints };
