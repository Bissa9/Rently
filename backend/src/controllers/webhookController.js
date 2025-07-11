const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Booking = require("../models/bookingModel");

const handleStripeWebhook = async (req, res) => {
  console.log("Webhook received");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // Verify the signature and parse the event
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("Stripe event type:", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Session metadata:", session.metadata);

    // Ensure the payment was successful
    if (session.payment_status !== "paid") {
      console.warn(`Session payment_status is '${session.payment_status}', not 'paid'. Skipping update.`);
      return res.status(200).json({ received: true });
    }

    const bookingId = session.metadata?.bookingId;
    console.log("Booking ID from metadata:", bookingId);

    if (!bookingId) {
      console.warn("No bookingId found in session metadata");
      return res.status(400).send("Missing bookingId in metadata");
    }

    try {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        console.log(`No booking found with ID: ${bookingId}`);
        return res.status(404).send("Booking not found");
      }

      console.log("Booking found, updating paymentStatus...");
      booking.paymentStatus = "paid";
      booking.status = "pending";
      await booking.save();
      console.log(`Payment confirmed for booking ID: ${bookingId}`);
    } catch (err) {
      console.error("Error updating booking after payment:", err.message);
      return res.status(500).send("Internal Server Error");
    }
  }

  // Acknowledge receipt of the event
  return res.status(200).json({ received: true });
};

module.exports = { handleStripeWebhook };
