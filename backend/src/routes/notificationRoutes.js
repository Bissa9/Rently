const express = require("express");
const {
  createBookingNotification,
  cancelBookingNotification,
  modifyBookingNotification,
} = require("../controllers/notificationController");

const router = express.Router();

router.post("/booking-notification", createBookingNotification);
router.post("/cancelled-notification", cancelBookingNotification);
router.post("/modify-booking-notification", modifyBookingNotification);
module.exports = router;
