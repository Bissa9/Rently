const Booking = require("../models/bookingModel");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { refundPayment } = require("../services/paymentService");
const LoyaltyProgram = require("../models/loyaltyprogModel");
const Car = require("../models/carModel");
const User = require("../models/userModel");
const {
  createBookingNotification,
  cancelBookingNotification,
  modifyBookingNotification,
} = require("./notificationController");

const calculateTotalCost = (pricePerDay, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysRented = Math.ceil((end - start) / (1000 * 3600 * 24));
  return daysRented * pricePerDay;
};

function parsePercentageFromCode(code) {
  const match = code.match(/DISCOUNT-(\d+)-/);
  if (!match) return 0;
  return Number(match[1]) / 100000;
}
const createCheckoutSession = async ({
  bookingId,
  userId,
  carName,
  amount,
  successUrl,
  cancelUrl,
}) => {
  return await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: carName },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: { bookingId, userId },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
};
const createBooking = async (req, res) => {
  try {
    const {
      carId,
      startDate,
      endDate,
      pickupLocation,
      paymentMethod,
      voucherCode,
    } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    // Validate required fields
    if (!carId || !startDate || !endDate || !pickupLocation || !paymentMethod) {
      return res
        .status(400)
        .json({ message: "All booking details are required" });
    }

    // Fetch car
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

// Validate that the chosen spot is one of the allowed handover spots
const attempted = pickupLocation.exactSpot;
if (!Array.isArray(car.location.spots) || !car.location.spots.includes(attempted)) {
  return res.status(400).json({
    message: "Pickup location must be one of the allowed handover spots",
    allowedSpots: car.location.spots,
    attemptedSpot: attempted,
  });
}


    // Calculate rental days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (rentalDays <= 0)
      return res.status(400).json({ message: "Invalid rental duration" });

    // Check for conflicting bookings
    const existingBooking = await Booking.findOne({
      car: carId,
      startDate: { $lte: end },
      endDate: { $gte: start },
      status: { $ne: "cancelled" },
    });
    if (existingBooking) {
      return res.status(409).json({
        message: "Car is already booked for the selected dates",
        conflictingDates: {
          existingStart: existingBooking.startDate,
          existingEnd: existingBooking.endDate,
        },
      });
    }

    // Calculate total before discount
    let totalAmount = calculateTotalCost(car.pricePerDay, startDate, endDate);

    let discountAmount = 0;

    if (voucherCode) {
      const loyaltyProgram = await LoyaltyProgram.findOne({ user: userId });
      if (!loyaltyProgram) {
        return res
          .status(400)
          .json({ message: "No loyalty program found for user" });
      }

      // Find unused discount code
      const discountEntry = loyaltyProgram.discountCodes.find(
        (dc) => dc.code === voucherCode && dc.used === false
      );

      if (!discountEntry) {
        return res
          .status(400)
          .json({ message: "Invalid or already used voucher code" });
      }

      // Calculate discount amount
      discountAmount = parsePercentageFromCode(voucherCode) * totalAmount;
      if (discountAmount > totalAmount) discountAmount = totalAmount;

      // Mark discount code as used (Boolean true)
      discountEntry.used = true;
      loyaltyProgram.markModified("discountCodes");
      await loyaltyProgram.save();
      totalAmount = totalAmount - discountAmount;
    }

    // Create booking with final total cost and discount info
    const newBooking = new Booking({
      user: userId,
      car: carId,
      startDate,
      endDate,
      totalCost: totalAmount,
      pickupLocation: {
        address: {
          city: pickupLocation.city,
          exactSpot: pickupLocation.exactSpot,
        },
      },
      paymentMethod,
      status: "pending",
      discountApplied: discountAmount,
      voucherCode: voucherCode || null,
    });

    await newBooking.save();
    const notification = await createBookingNotification({
      userId,
      carId,
      userEmail,
      startDate,
      endDate,
      pickupLocation: newBooking.pickupLocation,
      paymentMethod,
      totalCost: newBooking.totalCost,
    });
    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res
      .status(500)
      .json({ message: "Error creating booking", error: error.message });
  }
};
const makePayment = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const userId = req.user.id;

    const booking = await Booking.findById(bookingId).populate("car");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    const paymentMethod = booking.paymentMethod;
    const session = await createCheckoutSession({
      bookingId: booking._id.toString(),
      userId,
      carName: `${booking.car.make} ${booking.car.model}`,
      amount: booking.totalCost,
      successUrl: `${process.env.FRONTEND_URL}/allset?bookingId=${booking._id}`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment-cancelled?bookingId=${booking._id}`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout error:", error.message);
    res
      .status(500)
      .json({ message: "Error initiating payment", error: error.message });
  }
};

const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ user: userId });

    if (!bookings || bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No bookings found for this user" });
    }
    for (let booking of bookings) {
      booking.car = await Car.findById(booking.car);
    }

    res.status(200).json(bookings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving bookings", error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, pickupLocation, paymentMethod } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this booking" });
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending bookings can be updated" });
    }

    const car = await Car.findById(booking.car);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Validate pickup location if provided
    if (
      pickupLocation &&
      pickupLocation.exactSpot &&
      !car.location.spots.includes(pickupLocation.exactSpot)
    ) {
      return res.status(400).json({
        message: "Pickup location must be one of the allowed handover spots",
        allowedSpots: car.location.spots,
        attemptedSpot: pickupLocation.exactSpot,
      });
    }

    // Check for conflicting bookings
    const existingBooking = await Booking.findOne({
      car: booking.car,
      _id: { $ne: id },
      $and: [{ startDate: { $lt: endDate } }, { endDate: { $gt: startDate } }],
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "Car is not available during the updated dates",
      });
    }

    // Update booking fields
    booking.startDate = startDate || booking.startDate;
    booking.endDate = endDate || booking.endDate;
if (pickupLocation && pickupLocation.exactSpot) {
  const currentCity = booking.pickupLocation?.address?.city;

  if (!currentCity) {
    return res.status(400).json({
      message: "City is missing in booking and was not provided in update.",
    });
  }

  booking.pickupLocation = {
    address: {
      city: currentCity,
      exactSpot: pickupLocation.exactSpot.trim(),
    },
  };
}


    booking.paymentMethod = paymentMethod || booking.paymentMethod;
    booking.totalCost = calculateTotalCost(
      car.pricePerDay,
      booking.startDate,
      booking.endDate
    );

    const updatedBooking = await booking.save();

    // Send notification
    try {
      await modifyBookingNotification({
        bookingId: updatedBooking._id,
        newStartDate: updatedBooking.startDate,
        newEndDate: updatedBooking.endDate,
        userEmail: req.user.email,
        totalCost: updatedBooking.totalCost,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send modify booking notification:",
        notificationError.message
      );
    }

    return res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating booking",
      error: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to cancel this booking" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    let refundIssued = false;
    if (booking.paymentStatus === "paid") {
      console.log(`Attempting refund for booking ID: ${booking._id}`);

      const refundResult = await refundPayment(booking.paymentIntentId);
      console.log("Refund Result:", refundResult); // Debugging log

      if (!refundResult.success) {
        return res.status(400).json({
          message: "Refund failed",
          details: refundResult.message,
        });
      }

      booking.paymentStatus = "refunded";
      refundIssued = true;
    } else if (booking.paymentStatus === "pending") {
      booking.paymentStatus = "cancelled";
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    try {
      await cancelBookingNotification({
        bookingId: booking._id,
        userEmail: req.user.email,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send cancellation notification:",
        notificationError.message
      );
    }

    res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
      refundIssued,
    });
  } catch (error) {
    console.error("Cancellation error:", error);
    res.status(500).json({
      message: "Error cancelling booking",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const completeBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId).populate("car");

    if (!booking || booking.user.toString() !== req.user.id) {
      return res.status(404).json({
        message: "Booking not found or you don't have access to this booking",
      });
    }

    if (booking.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Booking must be pending to complete" });
    }

    //this to calculate owner's profit (60% of total cost)
    const ownerProfit = booking.totalCost * 0.6;

    booking.status = "completed";
    await booking.save();

    //to update car availability
    await Car.findByIdAndUpdate(booking.car._id, { availabilityStatus: true });

    //then, update owner's profit balance
    await User.findByIdAndUpdate(booking.car.owner, {
      $inc: { profitBalance: ownerProfit },
    });

    let loyaltyProgram = await LoyaltyProgram.findOne({ user: booking.user });

    if (!loyaltyProgram) {
      loyaltyProgram = new LoyaltyProgram({
        user: booking.user,
        pointsBalance: 0,
      });
    }

    const pointsEarned = Math.floor(booking.totalCost / 10);
    loyaltyProgram.pointsBalance += pointsEarned;

    await loyaltyProgram.save();

    res.status(200).json({
      message: "Booking completed and loyalty points added",
      pointsEarned,
      totalPoints: loyaltyProgram.pointsBalance,
      ownerProfit: ownerProfit,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error completing booking", error: error.message });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate("car", "make model licensePlate");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getOwnerEarnings = async (req, res) => {
  try {
    const ownerId = req.user.id;

    //first verify user is a car owner
    const user = await User.findById(ownerId);
    if (!user.isCarOwner) {
      return res.status(403).json({
        message: "Only car owners can access earnings information",
      });
    }

    //then get all the completed bookings for this owner
    const ownerCars = await Car.find({ owner: ownerId }).select("_id");
    const carIds = ownerCars.map((car) => car._id);

    const completedBookings = await Booking.find({
      car: { $in: carIds },
      status: "completed",
    });

    //then calculate total earnings
    const totalEarnings = completedBookings.reduce(
      (sum, booking) => sum + booking.totalCost * 0.9,
      0
    );

    res.status(200).json({
      totalEarnings: user.profitBalance, //current balance (feh kam f hesaby dlw2ty)
      lifetimeEarnings: totalEarnings, // All-time earnings (kol el kasbto within el app)
      completedBookings: completedBookings.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving earnings",
      error: error.message,
    });
  }
};

const getRentalHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentDate = new Date();

    //first, get all cars owned by the user
    const ownedCars = await Car.find({ owner: userId }).select("_id");
    const ownedCarIds = ownedCars.map((car) => car._id);

    //then, get all bookings where the user is either the renter or the car owner
    const allBookings = await Booking.find({
      $or: [
        { user: userId }, //user is the renter
        { car: { $in: ownedCarIds } }, //user owns the car
      ],
    })
      .populate("car", "_id")
      .sort({ startDate: -1 });

    const transformBooking = (booking) => ({
      id: booking._id,
      carId: booking.car._id,
      startDate: booking.startDate,
      endDate: booking.endDate,

      pickupLocation: booking.pickupLocation?.address,
      totalCost: booking.totalCost,
      discountApplied :booking.discountApplied, 
      status : booking.status,
    });

    const categorized = {
      asCustomer: {
        previous: [],
        ongoing: [],
        upcoming: [],
      },
      asHost: {
        previous: [],
        ongoing: [],
        upcoming: [],
      },
    };

    allBookings.forEach((booking) => {
      const isHostBooking = ownedCarIds.some((id) =>
        id.equals(booking.car._id)
      );
      const target = isHostBooking
        ? categorized.asHost
        : categorized.asCustomer;

      const simplifiedBooking = transformBooking(booking);

      if (booking.status === "completed" || booking.endDate < currentDate) {
        target.previous.push(simplifiedBooking);
      } else if (
        booking.status === "ongoing" ||
        (booking.startDate <= currentDate && booking.endDate >= currentDate)
      ) {
        target.ongoing.push(simplifiedBooking);
      } else if (
        booking.status === "pending" &&
        booking.startDate > currentDate
      ) {
        target.upcoming.push(simplifiedBooking);
      }
    });

    res.status(200).json(categorized);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving rental history",
      error: error.message,
    });
  }
};


const checkAvailability = async (req, res) => {
  const { carId, startDate, endDate } = req.body;
  try {
    const bookings = await Booking.find({
      car: carId,
      startDate: { $lte: endDate }, // booking starts on or before requested end date
      endDate: { $gte: startDate }, // booking ends on or after requested start date
      status: { $nin: ["cancelled", "completed"] }, // only active bookings
    }).select("startDate endDate status");

    if (bookings.length > 0) {
      return res.json({ available: false, conflictingBookings: bookings });
    }

    return res.json({ available: true });
  } catch (error) {
    console.error("Error checking availability:", error);
    res.status(500).json({ error: "Server error checking availability" });
  }
};

module.exports = {
  createBooking,
  makePayment,
  getBookingDetails,
  getUserBookings,
  updateBooking,
  cancelBooking,
  completeBooking,
  getOwnerEarnings,
  getRentalHistory,
  checkAvailability,
};
