const express = require("express");
const {
  makePayment,
  handleRefund,
} = require("../controllers/paymentController");
const { handleStripeWebhook } = require("../controllers/webhookController");

const router = express.Router();

router.post("/pay", makePayment);
router.post("/refund", handleRefund);

module.exports = router;
