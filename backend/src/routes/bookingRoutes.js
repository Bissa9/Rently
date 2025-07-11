const express = require("express");
const {
  createBooking,
  cancelBooking,
  updateBooking,
  getUserBookings,
  getBookingDetails,
  makePayment,
  completeBooking,
  getOwnerEarnings,
  getRentalHistory,
  checkAvailability
} = require("../controllers/bookingController");
const { protect, isCarOwner } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/historyrents", protect, getRentalHistory);
router.get("/history", protect, getUserBookings);
router.get("/owner/earnings", protect, isCarOwner, getOwnerEarnings);

router.post("/", protect, createBooking);
router.get("/:id", protect, getBookingDetails);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, cancelBooking);
router.post("/:id/payment", protect, makePayment);
router.post("/:id/complete", protect, completeBooking);
router.post("/check-availability", protect, checkAvailability);



module.exports = router;